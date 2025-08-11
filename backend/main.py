# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
from typing import Literal, Optional

app = FastAPI(title="Neurodesk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5123",
        # Electron usually loads file:// and talks via main process proxy,
        # but keeping these for web dev.
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/hello")
def hello():
    return {"message": "Hello from backend!"}

# ----- Command planning API -----

class CommandRequest(BaseModel):
    text: str

class CommandPlan(BaseModel):
    kind: Literal["open_app", "open_url", "search", "unknown"]
    app: Optional[str] = None
    url: Optional[str] = None
    query: Optional[str] = None
    raw: str

URL_RE = re.compile(
    r"(?i)\b((?:https?://)?(?:www\.)?[a-z0-9][a-z0-9\-]+\.[a-z]{2,}(?:[/?#][^\s]*)?)"
)

def normalize_url(s: str) -> str:
    s = s.strip()
    if not s:
        return s
    if not re.match(r"(?i)^[a-z]+://", s):
        # If user typed "youtube.com" or "www.youtube.com" add scheme
        return "https://" + s
    return s

def plan_command(text: str) -> CommandPlan:
    t = text.strip()
    lt = t.lower()

    # 1) explicit URL anywhere in text
    m = URL_RE.search(t)
    if m:
        return CommandPlan(kind="open_url", url=normalize_url(m.group(1)), raw=t)

    # 2) "open <app>" or "launch <app>"
    m = re.match(r"(?i)^(?:open|launch)\s+([a-z0-9 .+\-&]+)$", t)
    if m:
        appname = m.group(1).strip()
        return CommandPlan(kind="open_app", app=appname, raw=t)

    # 3) "open * to <url>"
    m = re.match(r"(?i)^open\s+([a-z0-9 .+\-&]+)\s+to\s+(.+)$", t)
    if m:
        url = normalize_url(m.group(2).strip())
        return CommandPlan(kind="open_url", url=url, raw=t)

    # 4) "go to <url>"
    m = re.match(r"(?i)^(?:go to|visit)\s+(.+)$", t)
    if m:
        return CommandPlan(kind="open_url", url=normalize_url(m.group(1).strip()), raw=t)

    # 5) "search <query>" or "google <query>"
    m = re.match(r"(?i)^(?:search|google)\s+(.+)$", t)
    if m:
        return CommandPlan(kind="search", query=m.group(1).strip(), raw=t)

    # 6) barewords that look like domain
    if re.match(r"(?i)^[a-z0-9][a-z0-9\-]+\.[a-z]{2,}(/.*)?$", lt):
        return CommandPlan(kind="open_url", url=normalize_url(t), raw=t)

    return CommandPlan(kind="unknown", raw=t)

@app.post("/commands/run")
def commands_run(req: CommandRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty command")
    plan = plan_command(req.text)

    # You can log here or enrich with additional info Electron might want
    return {
        "ok": True,
        "plan": plan.model_dump(),
        # Keep simple echo + normalized fields so Electron can act:
        "echo": req.text,
    }

# Optional: allow `python -m uvicorn main:app --reload`
# or `python main.py` for quick local runs
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5050, reload=True)
