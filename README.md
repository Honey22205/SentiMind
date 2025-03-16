# Customer Feedback Sentiment Analysis

This project provides a comprehensive solution for analyzing customer feedback and understanding public sentiment using multiple sentiment analysis approaches.

## Features

- Multiple sentiment analysis methods:
  - VADER (Valence Aware Dictionary and sEntiment Reasoner)
  - TextBlob
  - Transformer-based analysis (using Hugging Face transformers)
- Visualization of sentiment distributions
- Comprehensive analysis including:
  - Polarity scores
  - Subjectivity analysis
  - Compound sentiment scores
  - Detailed positive/negative/neutral breakdowns

## Installation

1. Clone this repository
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the sentiment analyzer:
```bash
python sentiment_analyzer.py
```

The script will:
1. Process example feedback
2. Generate sentiment analysis results
3. Create visualizations saved as 'sentiment_distribution.png'

## Customizing the Analysis

To analyze your own feedback data, modify the `feedback_examples` list in the `main()` function of `sentiment_analyzer.py`.

## Output

The analyzer provides:
- Numerical sentiment scores from multiple models
- Sentiment classifications
- Visualization of sentiment distributions
- Detailed breakdown of positive, negative, and neutral sentiments

## Visualization

The script generates a visualization file 'sentiment_distribution.png' showing:
- VADER compound score distribution
- TextBlob polarity distribution
- Transformer model label distribution 