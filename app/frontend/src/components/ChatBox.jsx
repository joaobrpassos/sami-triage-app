import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import './ChatBox.css'

const ChatBox = ({ triageData, sessionId, onSummaryUpdate }) => {
	const [messages, setMessages] = useState([])
	const [inputMessage, setInputMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [currentSessionId, setCurrentSessionId] = useState(sessionId ?? null)
	const messagesEndRef = useRef(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	useEffect(() => {
		setCurrentSessionId(sessionId ?? null)
	}, [sessionId])

	useEffect(() => {
		setMessages([])
		setInputMessage('')
	}, [triageData])

	const extractSummaryText = useCallback((summaryObject, fallbackResponse, errorText) => {
		if (summaryObject?.summary) {
			return summaryObject.summary
		}

		if (typeof fallbackResponse === 'string' && fallbackResponse.trim()) {
			return fallbackResponse.trim()
		}

		if (typeof errorText === 'string' && errorText.trim()) {
			return errorText.trim()
		}

		return 'I apologize, but I could not generate a summary.'
	}, [])

	const sendMessage = async (e) => {
		e.preventDefault()
		const trimmedMessage = inputMessage.trim()
		if (!trimmedMessage || loading) return

		const timestamp = new Date()
		const userMessage = { text: trimmedMessage, sender: 'user', timestamp }
		const updatedMessages = [...messages, userMessage]
		setMessages(updatedMessages)
		setInputMessage('')
		setLoading(true)

		try {
			const conversationHistory = updatedMessages.map((message) => ({
				role: message.sender === 'user' ? 'user' : 'assistant',
				content: message.text
			}))

			const payload = {
				message: trimmedMessage,
				messages: conversationHistory,
				triageData,
				...(currentSessionId ? { session_id: currentSessionId } : {})
			}

			const response = await axios.post('/chat', payload)
			const { summary, session_id: newSessionId, response: fallbackResponse, error } = response.data ?? {}

			if (newSessionId && newSessionId !== currentSessionId) {
				setCurrentSessionId(newSessionId)
			}

			let summaryForParent = summary ?? null
			if (summaryForParent && newSessionId) {
				summaryForParent = { ...summaryForParent, session_id: newSessionId }
			}
			if (!summaryForParent && fallbackResponse) {
				summaryForParent = {
					raw_response: fallbackResponse,
					session_id: newSessionId ?? currentSessionId ?? undefined
				}
			}
			if (onSummaryUpdate && summaryForParent) {
				onSummaryUpdate(summaryForParent)
			}

			const botText = extractSummaryText(summary, fallbackResponse, error)

			const botMessage = {
				text: botText,
				sender: 'bot',
				timestamp: new Date(),
				summary: summary ?? null,
				error: error ?? null
			}
			setMessages(prev => [...prev, botMessage])
		} catch (error) {
			const errorMessage = {
				text: 'Sorry, I encountered an error. Please try again.',
				sender: 'bot',
				timestamp: new Date(),
				isError: true
			}
			setMessages(prev => [...prev, errorMessage])
		} finally {
			setLoading(false)
		}
	}

	const formatTime = (timestamp) => {
		return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}

	return (
		<div className="chat-box">
			<div className="chat-header">
				<h3>Medical Chat Assistant</h3>
				<p>Ask questions about your symptoms and get guidance</p>
			</div>

			<div className="messages-container">
				{messages.length === 0 ? (
					<div className="welcome-message">
						<p>Hello! I'm your medical chat assistant. How can I help you today?</p>
						<p>You can ask about:</p>
						<ul>
							<li>Your symptoms and their possible causes</li>
							<li>Self-care recommendations</li>
							<li>When to seek immediate medical attention</li>
							<li>General health advice</li>
						</ul>
					</div>
				) : (
					messages.map((message, index) => (
						<div
							key={index}
							className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
						>
							<div className="message-content">
								<p>{message.text}</p>
								<span className="timestamp">{formatTime(message.timestamp)}</span>
							</div>
						</div>
					))
				)}
				{loading && (
					<div className="message bot">
						<div className="message-content">
							<div className="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<form onSubmit={sendMessage} className="chat-input-form">
				<div className="input-container">
					<input
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						placeholder="Type your message here..."
						disabled={loading}
					/>
					<button type="submit" disabled={!inputMessage.trim() || loading}>
						Send
					</button>
				</div>
				<p className="disclaimer">
					Note: This is an AI assistant and not a substitute for professional medical advice.
				</p>
			</form>
		</div>
	)
}

export default ChatBox
