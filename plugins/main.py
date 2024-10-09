from langchain_ollama import OllamaLLM
from langchain.evaluation import load_evaluator
from langchain.evaluation.criteria import CriteriaEvalChain

def evaluate_response(question: str, answer: str, ground_truth: str):
    # Initialize the Ollama LLM
    ollama_llm = OllamaLLM(model="llama3.2:1b")  # You can change the model as needed

    # Criteria evaluation
    criteria_evaluator = CriteriaEvalChain.from_llm(
        llm=ollama_llm,
        criteria={
            "accuracy": "Is the answer factually accurate based on the ground truth?",
            "completeness": "Does the answer address all aspects of the question?",
            "coherence": "Is the answer well-structured and logically coherent?",
        },
    )

    criteria_result = criteria_evaluator.evaluate_strings(
        prediction=answer, reference=ground_truth, input=question
    )

    # QA Relevance evaluation
    qa_relevance_evaluator = load_evaluator("qa", llm=ollama_llm)
    qa_relevance_result = qa_relevance_evaluator.evaluate_strings(
        prediction=answer, reference=ground_truth, input=question
    )

    # Process and return results
    criteria_scores = {
        criterion: float(criteria_result[criterion]) if criterion in criteria_result else -1
        for criterion in ["accuracy", "completeness", "coherence"]
    }
    qa_relevance_score = float(qa_relevance_result.get("score", -1))

    return {
        "criteria_scores": criteria_scores,
        "qa_relevance_score": qa_relevance_score,
    }

# Example usage
if __name__ == "__main__":
    result = evaluate_response(
        question="What is the capital of France?",
        answer="The capital of France is Paris.",
        ground_truth="Paris is the capital and most populous city of France."
    )
    print(result)