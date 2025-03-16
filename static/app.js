document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const feedbackContainer = document.getElementById('feedbackContainer');
    const addMoreBtn = document.getElementById('addMore');
    const analyzeBtn = document.getElementById('analyze');
    const resultsDiv = document.getElementById('results');
    const resultsList = document.getElementById('resultsList');
    const loadingDiv = document.getElementById('loading');
    const visualizationDiv = document.getElementById('visualization');
    const visualizationImage = document.getElementById('visualizationImage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Add another feedback input with animation
    addMoreBtn.addEventListener('click', () => {
        console.log('Add More clicked');
        const newGroup = document.createElement('div');
        newGroup.className = 'feedback-input-group animate-fade-in';
        
        const textarea = document.createElement('textarea');
        textarea.className = 'w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none';
        textarea.placeholder = 'Enter additional feedback...';
        
        newGroup.appendChild(textarea);
        feedbackContainer.appendChild(newGroup);
        
        // Animate the new textarea
        requestAnimationFrame(() => {
            textarea.style.opacity = '0';
            textarea.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                textarea.style.transition = 'all 0.3s ease';
                textarea.style.opacity = '1';
                textarea.style.transform = 'translateY(0)';
            });
        });
        
        textarea.focus();
    });

    // Show error message with animation
    const showError = (message) => {
        console.log('Showing error:', message);
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('animate-shake');
        
        setTimeout(() => {
            errorMessage.classList.add('hidden');
            errorMessage.classList.remove('animate-shake');
        }, 5000);
    };

    // Analyze feedback with enhanced UI feedback
    const analyzeFeedback = async (event) => {
        event.preventDefault();
        console.log('Analyze function called');

        // Update button state
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        analyzeBtn.classList.add('analyzing');
        
        const textareas = feedbackContainer.querySelectorAll('textarea');
        console.log('Found textareas:', textareas.length);
        
        const feedbackList = Array.from(textareas)
            .map(textarea => textarea.value.trim())
            .filter(text => text.length > 0);
        
        console.log('Feedback list:', feedbackList);

        if (feedbackList.length === 0) {
            showError('Please enter some feedback to analyze');
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'analyzing');
            return;
        }

        // Show loading state with animation
        loadingDiv.classList.remove('hidden');
        loadingDiv.classList.add('animate-fade-in');
        resultsDiv.classList.add('hidden');
        visualizationDiv.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            console.log('Sending request to server...');
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ feedback: feedbackList })
            });

            console.log('Response received:', response.status);
            
            const data = await response.json();
            console.log('Data received:', data);

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            // Clear previous results
            resultsList.innerHTML = '';

            // Display results with animations
            data.results.forEach((result, index) => {
                const sentimentClass = getSentimentClass(result.vader_compound);
                const scoreClass = getScoreClass(result.vader_compound);

                const resultCard = document.createElement('div');
                resultCard.className = `p-6 rounded-lg mb-4 sentiment-card ${sentimentClass} result-card`;
                resultCard.style.animationDelay = `${index * 0.1}s`;
                
                resultCard.innerHTML = `
                    <div class="mb-3 font-medium text-gray-800">${result.text}</div>
                    <div class="flex flex-wrap gap-4 text-sm">
                        <span class="sentiment-score ${scoreClass}" style="animation-delay: ${index * 0.1 + 0.2}s">
                            <i class="fas fa-robot mr-1"></i>
                            VADER: ${result.vader_compound.toFixed(2)}
                        </span>
                        <span class="sentiment-score ${getScoreClass(result.textblob_polarity)}" style="animation-delay: ${index * 0.1 + 0.3}s">
                            <i class="fas fa-comment-dots mr-1"></i>
                            TextBlob: ${result.textblob_polarity.toFixed(2)}
                        </span>
                        <span class="sentiment-score ${getTransformerClass(result.transformer_label)}" style="animation-delay: ${index * 0.1 + 0.4}s">
                            <i class="fas fa-brain mr-1"></i>
                            ${result.transformer_label}
                        </span>
                    </div>
                `;
                resultsList.appendChild(resultCard);
            });

            // Show visualization if available with animation
            if (data.visualization_available) {
                visualizationImage.src = `/api/visualization?${Date.now()}`; // Cache busting
                visualizationDiv.classList.remove('hidden');
                visualizationDiv.classList.add('animate-fade-in');
            }

            resultsDiv.classList.remove('hidden');
            resultsDiv.classList.add('animate-fade-in');
            
            // Scroll to results smoothly
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Error during analysis:', error);
            showError(`Error analyzing feedback: ${error.message}`);
        } finally {
            loadingDiv.classList.add('hidden');
            loadingDiv.classList.remove('animate-fade-in');
            // Re-enable analyze button
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'analyzing');
        }
    };

    // Add form submit event listener
    const form = document.getElementById('feedbackForm');
    if (form) {
        console.log('Adding submit listener to form');
        form.addEventListener('submit', analyzeFeedback);
    } else {
        console.error('Form not found!');
    }

    // Helper functions for styling
    function getSentimentClass(score) {
        if (score > 0.05) return 'sentiment-positive';
        if (score < -0.05) return 'sentiment-negative';
        return 'sentiment-neutral';
    }

    function getScoreClass(score) {
        if (score > 0.05) return 'score-positive';
        if (score < -0.05) return 'score-negative';
        return 'score-neutral';
    }

    function getTransformerClass(label) {
        if (label.includes('POSITIVE')) return 'score-positive';
        if (label.includes('NEGATIVE')) return 'score-negative';
        return 'score-neutral';
    }
}); 