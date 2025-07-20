<template>
	<div>
		<v-btn
			color="success"
			variant="outlined"
			class="ml-2"
			id="export-pdf-btn"
			@click="exportProfileAsPDF"
			:aria-label="$t('exportProfileAsPDF')"
		>
			<v-icon left aria-hidden="true">mdi-file-pdf-box</v-icon>
			{{ $t('exportAsPDF') }}
		</v-btn>
	</div>
</template>

<script>
	import jsPDF from "jspdf"
	import '@/fonts/times-new-roman-14-normal'

	export default {
		name: "PdfExporter",
		props: {
			userProfile: {
				type: Object,
				required: true
			},
			userProjects: {
				type: Array,
				default: () => []
			}
		},
		methods: {
			exportProfileAsPDF() {
				// Create a new PDF document with UTF-8 support
				const pdf = new jsPDF('p', 'mm', 'a4')
				
				// Use default fonts that support Vietnamese characters
				pdf.setFont('times-new-roman-14')
				
				const pageWidth = pdf.internal.pageSize.getWidth()
				const pageHeight = pdf.internal.pageSize.getHeight()
				const margin = 20
				const contentWidth = pageWidth - (2 * margin)
				
				let yPosition = margin
				
				// Helper function to add text with word wrapping
				const addWrappedText = (text, fontSize, maxWidth = contentWidth) => {
					if (!text) return yPosition
					
					pdf.setFontSize(fontSize)
					pdf.setFont('times-new-roman-14')
					
					const lines = pdf.splitTextToSize(text, maxWidth)
					
					// Check if we need a new page
					if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
						pdf.addPage()
						yPosition = margin
					}
					
					pdf.text(lines, margin, yPosition)
					yPosition += lines.length * fontSize * 0.4 + 5
					return yPosition
				}
				
				// Helper function to add section header
				const addSectionHeader = (text) => {
					yPosition = addWrappedText(text, 16)
					// Add underline
					pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
					yPosition += 10
				}
				
				// Helper function to add contact info in a structured way
				const addContactInfo = () => {
					const contactItems = []
					if (this.userProfile.email) contactItems.push({ icon: '📧', text: this.userProfile.email })
					if (this.userProfile.githubUrl) contactItems.push({ icon: '🐙', text: this.userProfile.githubUrl })
					
					if (contactItems.length > 0) {
						yPosition += 8
						contactItems.forEach((item, index) => {
							const contactText = `${item.icon} ${item.text}`
							yPosition = addWrappedText(contactText, 10, contentWidth)
						})
					}
				}
				
				// CV HEADER SECTION
				const fullName = `${this.userProfile.firstName || ''} ${this.userProfile.lastName || ''}`.trim()
				yPosition = addWrappedText(fullName, 28, contentWidth)
				yPosition = addWrappedText(`@${this.userProfile.username || ''}`, 14, contentWidth)
				
				// Professional Summary
				if (this.userProfile.bio) {
					yPosition += 8
					addSectionHeader('Professional Summary')
					yPosition = addWrappedText(this.userProfile.bio, 11, contentWidth)
				}
				
				// Contact Information
				addContactInfo()
				
				// TECHNICAL SKILLS SECTION (from project tags)
				const allTags = new Set()
				this.userProjects?.forEach(project => {
					project.tags?.forEach(tag => allTags.add(tag))
				})
				
				if (allTags.size > 0) {
					yPosition += 15
					addSectionHeader('Technical Skills')
					const skillsText = Array.from(allTags).join(' • ')
					yPosition = addWrappedText(skillsText, 11, contentWidth)
				}
				
				// PROJECT EXPERIENCE SECTION
				if (this.userProjects && this.userProjects.length > 0) {
					yPosition += 15
					addSectionHeader('Project Experience')
					
					this.userProjects.forEach((project, index) => {
						// Project title and type
						const projectHeader = project.type ? `${project.title} (${project.type})` : project.title
						yPosition = addWrappedText(projectHeader, 14, contentWidth)
						
						// Project description
						if (project.description) {
							yPosition = addWrappedText(project.description, 11, contentWidth)
						}
						
						// Technologies used
						if (project.tags && project.tags.length > 0) {
							const techText = `Technologies: ${project.tags.join(', ')}`
							yPosition = addWrappedText(techText, 10, contentWidth)
						}
						
						// Project details (strip HTML and limit length for CV)
						if (project.content) {
							const plainContent = project.content.replace(/<[^>]*>/g, '').trim()
							if (plainContent) {
								// Limit content length for CV format
								const maxLength = 300
								const truncatedContent = plainContent.length > maxLength 
									? plainContent.substring(0, maxLength) + '...'
									: plainContent
								yPosition = addWrappedText(truncatedContent, 10, contentWidth)
							}
						}
						
						// GitHub link
						if (project.githubUrl) {
							yPosition = addWrappedText(`Repository: ${project.githubUrl}`, 9, contentWidth)
						}
						
						// Add spacing between projects
						if (index < this.userProjects.length - 1) {
							yPosition += 8
						}
					})
				}
				
				// Footer
				pdf.setFontSize(8)
				pdf.setTextColor(128)
				const footerText = `Generated from CodeFolio Portfolio - ${new Date().toLocaleDateString()}`
				pdf.text(footerText, margin, pageHeight - 10)
				
				// Save the PDF
				const filename = `${this.userProfile.username || 'profile'}_codefolio.pdf`
				pdf.save(filename)
			}
		}
	}
</script> 