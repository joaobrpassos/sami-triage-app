import os
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import google.generativeai as genai

class GeminiAIProvider:
    """Google Gemini AI provider"""
    
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        
        # Get model from environment or use default
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
        print(f"Using model: {self.model_name}")
        
        try:
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
            print(f"Error with model {self.model_name}: {e}")
            # Fallback to listing available models
            self.list_available_models()
            raise
    
    def list_available_models(self):
        """List available models for debugging"""
        try:
            print("Available models:")
            models = genai.list_models()
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    print(f"  - {model.name}")
        except Exception as e:
            print(f"Error listing models: {e}")
    
    def complete(self, prompt: str, system_message: Optional[str] = None) -> str:
        try:
            # Combine system message and prompt
            full_prompt = f"{system_message}\n\n{prompt}" if system_message else prompt
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            logging.error(f"Gemini AI request failed: {e}")
            raise Exception(f"Gemini AI service error: {e}")
    
    def chat_complete(self, messages: List[Dict[str, str]], triage_context: Optional[Dict] = None) -> str:
        """Run chat conversation with message history and triage context"""
        try:
            # Start a chat session
            chat = self.model.start_chat(history=[])
            
            # Build context-aware prompt if triage info is available
            if triage_context:
                context_prompt = self._build_context_prompt(triage_context, messages)
                response = chat.send_message(context_prompt)
            else:
                # Send the last message (most recent) to get response
                last_message = messages[-1]["content"]
                response = chat.send_message(last_message)
            
            return response.text
            
        except Exception as e:
            logging.error(f"Gemini chat failed: {e}")
            raise Exception(f"Gemini chat error: {e}")
    
    def _build_context_prompt(self, triage_context: Dict, messages: List[Dict[str, str]]) -> str:
        """Build a prompt that includes triage context"""
        context_info = f"""
You are a professional healthcare assistant specialized in patient triage. 
Provide accurate, clinically appropriate SOAP notes. Be concise but thorough.
Focus on patient safety and appropriate next steps. 
Your goal is to create a complete SOAP note of the case, ask the nescessary questions to complete and return the SOAP note. 
Please format your response exactly like this:
Subjective: [patient symptoms description]
Objective: [clinical observations] 
Assessment: [clinical impression and priority]
Plan: [recommended actions]
Next Step: [specific recommendation]


PATIENT TRIAGE CONTEXT (remember this information):
- Age: {triage_context.get('age', 'Not specified')}
- Initial Symptoms: {triage_context.get('symptoms', 'Not specified')}
- Medical History: {triage_context.get('medical_history', 'None provided')}
- Current Assessment: {triage_context.get('assessment', 'Not assessed')}
- Current Plan: {triage_context.get('plan', 'No plan yet')}

CONVERSATION HISTORY:
"""
        
        # Add conversation history
        for msg in messages:
            role = "Patient" if msg["role"] == "user" else "Assistant"
            context_info += f"{role}: {msg['content']}\n"
        
        context_info += "\nPlease continue the conversation while keeping the patient's triage context in mind."
        
        return context_info

class Agent:
    """Main Agent class that integrates with your Flask app"""
    
    def __init__(self):
        self.ai_provider = self._create_ai_provider()
        self.logger = self._setup_logging()
        # Store triage sessions in memory (in production, use a database)
        self.triage_sessions = {}
    
    def _create_ai_provider(self):
        """Create AI provider - only Gemini supported now"""
        try:
            return GeminiAIProvider()
        except Exception as e:
            print(f"Failed to initialize Gemini: {e}")
            raise
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging"""
        logger = logging.getLogger("TriageAgent")
        logger.setLevel(logging.INFO)
        
        if logger.handlers:
            logger.handlers.clear()
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
        
        return logger
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method called by your Flask app for triage
        Expects data with: symptoms, age, medical_history (optional)
        Returns response in the exact format your frontend expects
        """
        request_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # Extract data with defaults
            symptoms = data.get('symptoms', '')
            age = data.get('age', 0)
            medical_history = data.get('medical_history', '')
            
            # Generate AI response
            response = self._generate_ai_response(symptoms, age, medical_history)
            
            # Calculate latency
            latency = f"{(datetime.now() - start_time).total_seconds():.3f}s"
            
            # Store triage session for future chat conversations
            session_id = str(uuid.uuid4())
            self.triage_sessions[session_id] = {
                'symptoms': symptoms,
                'age': age,
                'medical_history': medical_history,
                'assessment': response.get('assessment', ''),
                'plan': response.get('plan', ''),
                'created_at': datetime.now().isoformat()
            }
            
            # Log successful request
            self._log_request(request_id, "success", latency)
            
            # Add metadata to response
            response.update({
                "request_id": request_id,
                "session_id": session_id,  # Important: This links triage to chat
                "latency": latency,
                "timestamp": datetime.now().isoformat(),
                "ai_provider": "GeminiAI",
                "model_used": self.ai_provider.model_name
            })
            
            return response
            
        except Exception as e:
            latency = f"{(datetime.now() - start_time).total_seconds():.3f}s"
            self._log_request(request_id, f"error: {str(e)}", latency)
            
            # Return error response
            return {
                "subjective": f"Patient reports: {data.get('symptoms', '')}",
                "objective": "Evaluation unavailable",
                "assessment": "Service temporarily unavailable",
                "plan": "Please try again later",
                "nextStep": "Contact support",
                "start_chat": False,
                "error": str(e),
                "request_id": request_id,
                "latency": latency,
                "timestamp": datetime.now().isoformat()
            }
    
    def run_chat(self, payload: Any, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run chat conversation with optional triage context.
        Accepts either:
          - a plain string representing the latest user message
          - a dict containing a 'message' string or legacy 'messages' list
          - a list of message dicts in the format [{"role": "user", "content": "..."}, ...]
        Returns AI response for conversation
        """
        request_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            messages: List[Dict[str, str]] = []

            if isinstance(payload, str):
                message_text = payload.strip()
                if not message_text:
                    raise ValueError("Message cannot be empty")
                messages = [{"role": "user", "content": message_text}]
            elif isinstance(payload, dict):
                if "message" in payload and isinstance(payload["message"], str):
                    message_text = payload["message"].strip()
                    if not message_text:
                        raise ValueError("Message cannot be empty")
                    messages = [{"role": "user", "content": message_text}]
                elif "messages" in payload and isinstance(payload["messages"], list):
                    messages = payload["messages"]
                else:
                    raise ValueError("Payload must contain 'message' string or 'messages' list")
            elif isinstance(payload, list):
                messages = payload
            else:
                raise ValueError("Unsupported payload type for chat")

            if not messages:
                raise ValueError("Messages list cannot be empty")

            # Get triage context if session_id is provided
            triage_context = None
            if session_id and session_id in self.triage_sessions:
                triage_context = self.triage_sessions[session_id]
                print(f"Using triage context for session: {session_id}")
            
            # Get AI response for chat with context
            ai_response = self.ai_provider.chat_complete(messages, triage_context)
            
            # Calculate latency
            latency = f"{(datetime.now() - start_time).total_seconds():.3f}s"
            
            # Log successful request
            self._log_request(request_id, "chat_success", latency)
            
            response_data = {
                "response": ai_response,
                "request_id": request_id,
                "latency": latency,
                "timestamp": datetime.now().isoformat(),
                "ai_provider": "GeminiAI",
                "model_used": self.ai_provider.model_name,
                "message_count": len(messages),
                "has_triage_context": triage_context is not None
            }
            
            # Include session_id in response if we have context
            if session_id:
                response_data["session_id"] = session_id
            
            return response_data
            
        except Exception as e:
            latency = f"{(datetime.now() - start_time).total_seconds():.3f}s"
            self._log_request(request_id, f"chat_error: {str(e)}", latency)
            
            return {
                "response": "I apologize, but I'm having trouble responding right now. Please try again.",
                "error": str(e),
                "request_id": request_id,
                "latency": latency,
                "timestamp": datetime.now().isoformat(),
                "has_triage_context": False
            }
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get triage session information"""
        return self.triage_sessions.get(session_id)
    
    def _generate_ai_response(self, symptoms: str, age: int, medical_history: str) -> Dict[str, Any]:
        """Generate response using AI provider"""
        prompt = self._build_soap_prompt(symptoms, age, medical_history)
        system_message = self._get_system_prompt()
        
        ai_response = self.ai_provider.complete(prompt, system_message)
        
        # Parse AI response into structured format
        return self._parse_ai_response(ai_response, symptoms)
    
    def _build_soap_prompt(self, symptoms: str, age: int, medical_history: str) -> str:
        """Build SOAP format prompt for AI"""
        return f"""
Create a clinical SOAP note for patient triage based on this information:

Patient Age: {age}
Symptoms: {symptoms}
Medical History: {medical_history if medical_history else "None provided"}

Please provide a concise SOAP note with these exact sections:
- Subjective: Patient's reported symptoms in their own words
- Objective: Clinical observations and vital signs
- Assessment: Clinical impression and triage priority
- Plan: Recommended actions and next steps
- Next Step: Specific recommendation (emergency care, teleconsultation, or self-care)
- start_chat: Boolean variable (True/False) - True if teleconsultation chat is needed

Format the response as a structured clinical note. If inputs are in Portuguese, return response in Portuguese.

Please format your response exactly like this:
Subjective: [patient symptoms description]
Objective: [clinical observations] 
Assessment: [clinical impression and priority]
Plan: [recommended actions]
Next Step: [specific recommendation]
start_chat: [True/False]
"""
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for AI"""
        return """You are a professional healthcare assistant specialized in patient triage. 
Provide accurate, clinically appropriate SOAP notes. Be concise but thorough.
Focus on patient safety and appropriate next steps.
Return ONLY the SOAP note without any additional commentary.
Format your response with clear section headers followed by colons."""
    
    def _parse_ai_response(self, ai_response: str, original_symptoms: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        try:
            # Initialize with defaults
            sections = {
                "subjective": f"Patient reports: {original_symptoms}",
                "objective": "Clinical evaluation needed",
                "assessment": "Professional assessment required", 
                "plan": "Follow medical advice",
                "nextStep": "Teleconsultation recommended",
                "start_chat": False
            }
            
            lines = ai_response.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                
                # Detect section headers
                if line.lower().startswith('subjective'):
                    current_section = 'subjective'
                    if ':' in line:
                        sections['subjective'] = line.split(':', 1)[1].strip()
                    continue
                elif line.lower().startswith('objective'):
                    current_section = 'objective'
                    if ':' in line:
                        sections['objective'] = line.split(':', 1)[1].strip()
                    continue
                elif line.lower().startswith('assessment'):
                    current_section = 'assessment'
                    if ':' in line:
                        sections['assessment'] = line.split(':', 1)[1].strip()
                    continue
                elif line.lower().startswith('plan'):
                    current_section = 'plan'
                    if ':' in line:
                        sections['plan'] = line.split(':', 1)[1].strip()
                    continue
                elif 'next step' in line.lower():
                    current_section = 'nextStep'
                    if ':' in line:
                        sections['nextStep'] = line.split(':', 1)[1].strip()
                    continue
                elif 'start_chat' in line.lower():
                    current_section = 'start_chat'
                    if ':' in line:
                        start_chat_value = line.split(':', 1)[1].strip().lower()
                        sections['start_chat'] = start_chat_value in ['true', 'yes', '1', 'verdadeiro', 'sim']
                    continue
                
                # Add content to current section
                if current_section and line and current_section != 'start_chat':
                    if not line.startswith('-') and not line.startswith('**'):
                        if sections[current_section] != "":
                            sections[current_section] += " " + line
                        else:
                            sections[current_section] = line
            
            return {
                "subjective": sections["subjective"],
                "objective": sections["objective"],
                "assessment": sections["assessment"],
                "plan": sections["plan"],
                "nextStep": sections["nextStep"],
                "start_chat": sections["start_chat"]
            }
            
        except Exception as e:
            print(f"AI response parsing failed: {e}")
            print(f"AI Response was: {ai_response}")
            # Fallback response
            return {
                "subjective": f"Patient reports: {original_symptoms}",
                "objective": "AI evaluation completed",
                "assessment": "Requires professional review",
                "plan": "Follow healthcare provider guidance",
                "nextStep": "Teleconsultation recommended",
                "start_chat": self._should_start_chat(original_symptoms)
            }
    
    def _should_start_chat(self, symptoms: str) -> bool:
        """Determine if chat should be started based on symptoms"""
        symptoms_lower = symptoms.lower()
        non_urgent_but_chat = ["fever", "headache", "cough", "cold", "pain", "nausea"]
        return any(symptom in symptoms_lower for symptom in non_urgent_but_chat)
    
    def _log_request(self, request_id: str, status: str, latency: str):
        """Log request information"""
        print(f"TriageAgent - Request {request_id} - Status: {status} - Latency: {latency}")
