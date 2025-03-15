from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load Gemma-2B model & tokenizer
model_name = "google/gemma-2b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, device_map="auto")

# Generate a response
def chat_with_gemma(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")  # Use GPU if available
    output = model.generate(**inputs, max_length=100)
    return tokenizer.decode(output[0], skip_special_tokens=True)

print(chat_with_gemma("Hello, how are you?"))
