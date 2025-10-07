import React, { useState } from 'react'
import TriageForm from './components/TriageForm'
import ChatBox from './components/ChatBox'
import './App.css'

function App() {
	const [triageCompleted, setTriageCompleted] = useState(false)
	const [triageData, setTriageData] = useState(null)
	const [latestSummary, setLatestSummary] = useState(null)
	const [sessionId, setSessionId] = useState(null)

	const fallbackSummary = triageData?.triageResult?.summary ?? triageData?.triageResult ?? null
	const soapSummary = latestSummary ?? fallbackSummary

	const handleTriageComplete = (data) => {
		setTriageData(data)
		const initialSummary = data?.triageResult?.summary ?? data?.triageResult ?? null
		setLatestSummary(initialSummary)
		const initialSessionId = initialSummary?.session_id ?? null
		setSessionId(initialSessionId)
		setTriageCompleted(true)
	}

	const handleReset = () => {
		setTriageCompleted(false)
		setTriageData(null)
		setLatestSummary(null)
		setSessionId(null)
	}

	const handleSummaryUpdate = (summary) => {
		if (!summary) {
			return
		}
		setLatestSummary(summary)
		if (summary.session_id) {
			setSessionId(summary.session_id)
		}
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
									{soapSummary && (
										<div className="soap-summary">
											<h4>SOAP Summary</h4>
											<ul>
												<li>
													<strong>Subjective:</strong>
													<span>{soapSummary.subjective || 'Not available'}</span>
												</li>
												<li>
													<strong>Objective:</strong>
													<span>{soapSummary.objective || 'Not available'}</span>
												</li>
												<li>
													<strong>Assessment:</strong>
													<span>{soapSummary.assessment || 'Not available'}</span>
												</li>
												<li>
													<strong>Plan:</strong>
													<span>{soapSummary.plan || 'Not available'}</span>
												</li>
												<li>
													<strong>Next Step:</strong>
													<span>{soapSummary.nextStep || 'Not available'}</span>
												</li>
											</ul>
										</div>
									)}
								</div>
							</div>
							<ChatBox
								triageData={triageData}
								sessionId={sessionId}
								onSummaryUpdate={handleSummaryUpdate}
							/>
						</div>
					)}
				</main>
			</div>
		</div>
	)
}

export default App
