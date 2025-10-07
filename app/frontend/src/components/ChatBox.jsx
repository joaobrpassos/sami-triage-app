import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatBox.css'

const ChatBox = ({ triageData }) => {
	const [messages, setMessages] = useState([])
	const [inputMessage, setInputMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const messagesEndRef = useRef(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const sendMessage = async (e) => {
		e.preventDefault()
		if (!inputMessage.trim() || loading) return

		const userMessage = { text: inputMessage, sender: 'user', timestamp: new Date() }
		setMessages(prev => [...prev, userMessage])
		setInputMessage('')
		setLoading(true)

		try {
			const response = await axios.post('/api/chat', {
				message: inputMessage,
				triageData: triageData,
				conversationHistory: messages
			})

			const botMessage = {
				text: response.data.response,
				sender: 'bot',
				timestamp: new Date()
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
