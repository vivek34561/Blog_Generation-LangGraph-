import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM

import os
from dotenv import load_dotenv
load_dotenv()

app=FastAPI()

# Serve static frontend assets
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for local development and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the alternate UI at the root
@app.get("/")
def serve_index():
    return FileResponse("static/alt.html")

# Serve alternate UI
@app.get("/alt")
def serve_alt():
    return FileResponse("static/alt.html")

print(os.getenv("LANGCHAIN_API_KEY"))

os.environ["LANGSMITH_API_KEY"]=os.getenv("LANGCHAIN_API_KEY")

## API's

@app.post("/blogs")
async def create_blogs(request:Request):
    
    data=await request.json()
    topic= data.get("topic","")
    language = data.get("language", '')
    print(language)

    ## get the llm object

    groqllm=GroqLLM()
    llm=groqllm.get_llm()

    ## get the graph
    graph_builder= GraphBuilder(llm)
    if topic and language:
        graph=graph_builder.setup_graph(usecase="language")
        state=graph.invoke({"topic":topic,"current_language":language.lower()})

    elif topic:
        graph=graph_builder.setup_graph(usecase="topic")
        state=graph.invoke({"topic":topic})

    return {"data":state}


if __name__=="__main__":
    uvicorn.run("app:app",host="0.0.0.0",port=8000,reload=True)

