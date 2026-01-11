import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM

import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Enable CORS (important for cross-origin requests from Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your Vercel domain for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(os.getenv("LANGCHAIN_API_KEY"))

os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")

## API's

@app.post("/blogs")
async def create_blogs(request: Request):
    data = await request.json()
    topic = data.get("topic", "")
    language = data.get("language", '')
    print(language)

    ## get the llm object
    groqllm = GroqLLM()
    llm = groqllm.get_llm()

    ## get the graph
    graph_builder = GraphBuilder(llm)
    if topic and language:
        graph = graph_builder.setup_graph(usecase="language")
        state = graph.invoke({"topic": topic, "current_language": language.lower()})
    elif topic:
        graph = graph_builder.setup_graph(usecase="topic")
        state = graph.invoke({"topic": topic})

    return {"data": state}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)