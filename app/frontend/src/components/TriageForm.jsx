import React, { useState } from 'react'
import axios from 'axios'
import './TriageForm.css'

const TriageForm = ({ onTriageComplete }) => {
	const [formData, setFormData] = useState({
		symptoms: '',
		severity: 5,
		duration: '',
		age: '',
		gender: '',
		medicalHistory: '',
		currentMedications: ''
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const response = await axios.post('/triage', formData)
			onTriageComplete({
				...formData,
				triageResult: response.data
			})
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to submit triage form')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="triage-form-container">
			<h2>Medical Triage Assessment</h2>
			<p className="form-description">
				Please provide your symptoms and medical information to help us assess your condition.
			</p>

			<form onSubmit={handleSubmit} className="triage-form">
				<div className="form-group">
					<label htmlFor="symptoms">Symptoms *</label>
					<textarea
						id="symptoms"
						name="symptoms"
						value={formData.symptoms}
						onChange={handleChange}
						placeholder="Describe your symptoms in detail..."
						required
						rows="4"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="severity">
						Pain/Severity Level: {formData.severity}/10
					</label>
					<input
						type="range"
						id="severity"
						name="severity"
						min="1"
						max="10"
						value={formData.severity}
						onChange={handleChange}
					/>
					<div className="severity-labels">
						<span>Mild</span>
						<span>Severe</span>
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="duration">Duration of Symptoms *</label>
					<input
						type="text"
						id="duration"
						name="duration"
						value={formData.duration}
						onChange={handleChange}
						placeholder="e.g., 2 days, 3 hours, 1 week"
						required
					/>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="age">Age</label>
						<input
							type="number"
							id="age"
							name="age"
							min="0"
							value={formData.age}
							onChange={handleChange}
							placeholder="Your age"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="gender">Gender</label>
						<select
							id="gender"
							name="gender"
							value={formData.gender}
							onChange={handleChange}
						>
							<option value="">Select</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="medicalHistory">Medical History</label>
					<textarea
						id="medicalHistory"
						name="medicalHistory"
						value={formData.medicalHistory}
						onChange={handleChange}
						placeholder="Any pre-existing conditions, surgeries, etc."
						rows="3"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="currentMedications">Current Medications</label>
					<textarea
						id="currentMedications"
						name="currentMedications"
						value={formData.currentMedications}
						onChange={handleChange}
						placeholder="List any medications you're currently taking"
						rows="3"
					/>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button
					type="submit"
					className="submit-btn"
					disabled={loading}
				>
					{loading ? 'Assessing...' : 'Submit Triage Information'}
				</button>
			</form>
		</div>
	)
}

export default TriageForm
