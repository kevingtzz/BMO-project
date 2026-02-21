"""
LangGraph orchestrator: state schema, nodes, edges, compiled graph.
No I/O to the face here; output is via state["pending_face_events"] (drained by runner).
"""

from langgraph.graph import END, START, StateGraph

from bmo_brain.nodes import infer_expression, process_input
from bmo_brain.state import State


def build_graph():
    """Build and return the compiled graph (invoke/stream entry point)."""
    builder = StateGraph(state_schema=State)
    builder.add_node("infer_expression", infer_expression)
    builder.add_node("process_input", process_input)
    builder.add_edge(START, "infer_expression")
    builder.add_edge("infer_expression", "process_input")
    builder.add_edge("process_input", END)
    return builder.compile()


# Singleton compiled graph for the runner (Paso 8)
graph = build_graph()
