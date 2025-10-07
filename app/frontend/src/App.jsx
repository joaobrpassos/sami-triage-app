import React, { useState } from 'react'
import TriageForm from './components/TriageForm'
import ChatBox from './components/ChatBox'
import './App.css'

function App() {
	const [triageCompleted, setTriageCompleted] = useState(false)
	const [triageData, setTriageData] = useState(null)

	const handleTriageComplete = (data) => {
		setTriageData(data)
		setTriageCompleted(true)
	}

	const handleReset = () => {
		setTriageCompleted(false)
		setTriageData(null)
	}

	return (
		<div className="app">
			<div className="container">
				<header className="header">
					<h1>Medical Chat Assistant</h1>
					<p>Get immediate medical guidance and support</p>
				</header>

				<main className="main-content">
					{!triageCompleted ? (
						<TriageForm onTriageComplete={handleTriageComplete} />
					) : (
						<div className="chat-section">
							<div className="triage-summary">
								<h3>Triage Information</h3>
								<div className="summary-content">
									<p><strong>Symptoms:</strong> {triageData.symptoms}</p>
									<p><strong>Severity:</strong> {triageData.severity}/10</p>
									<p><strong>Duration:</strong> {triageData.duration}</p>
									<button onClick={handleReset} className="reset-btn">
										Update Triage Info
									</button>
								</div>
							</div>
							<ChatBox triageData={triageData} />
						</div>
					)}
				</main>
			</div>
		</div>
	)
}

export default App
