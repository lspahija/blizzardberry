admin portal where they enter an action curl and the curl is parsed into json and the json is saved as a tool

when a user uses their chatbot, and wants to perform an action, the llm retrieves the tool corresponding to that action

the chatbot frontend widget populates a fetch request with the tool's url, http method, headers, and body and executes the request

another llm instance without tools is then called to parse the response and return a user-friendly message