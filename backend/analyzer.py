import ollama
from prompts import SYSTEM_PROMPT

def analyze_frame(image_path):

    response = ollama.chat(
        model='llava',
        messages=[
            {
                'role': 'system',
                'content': SYSTEM_PROMPT
            },
            {
                'role': 'user',
                'content': 'Analyze this image carefully.',
                'images': [image_path]
            }
        ]
    )

    return response['message']['content']


if __name__ == "__main__":

    image = "test_frame.jpg"

    result = analyze_frame(image)

    print("\nFRAME ANALYSIS REPORT\n")
    print(result)