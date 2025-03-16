import pandas as pd
import nltk
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict
import logging

class SentimentAnalyzer:
    def __init__(self):
        """Initialize the sentiment analyzer with multiple models"""
        # Download necessary NLTK data
        try:
            nltk.download('punkt')
            nltk.download('averaged_perceptron_tagger')
        except Exception as e:
            logging.warning(f"NLTK download error: {e}")

        # Initialize analyzers
        self.vader = SentimentIntensityAnalyzer()
        self.transformer = pipeline("sentiment-analysis")

    def analyze_text_vader(self, text: str) -> Dict:
        """Analyze text using VADER sentiment analyzer"""
        return self.vader.polarity_scores(text)

    def analyze_text_textblob(self, text: str) -> Dict:
        """Analyze text using TextBlob"""
        analysis = TextBlob(text)
        return {
            'polarity': analysis.sentiment.polarity,
            'subjectivity': analysis.sentiment.subjectivity
        }

    def analyze_text_transformer(self, text: str) -> Dict:
        """Analyze text using transformer model"""
        result = self.transformer(text)[0]
        return {
            'label': result['label'],
            'score': result['score']
        }

    def analyze_feedback(self, feedback_list: List[str]) -> pd.DataFrame:
        """Analyze a list of feedback using all methods"""
        results = []
        
        for text in feedback_list:
            vader_result = self.analyze_text_vader(text)
            textblob_result = self.analyze_text_textblob(text)
            transformer_result = self.analyze_text_transformer(text)
            
            result = {
                'text': text,
                'vader_compound': vader_result['compound'],
                'vader_pos': vader_result['pos'],
                'vader_neg': vader_result['neg'],
                'vader_neu': vader_result['neu'],
                'textblob_polarity': textblob_result['polarity'],
                'textblob_subjectivity': textblob_result['subjectivity'],
                'transformer_label': transformer_result['label'],
                'transformer_score': transformer_result['score']
            }
            results.append(result)
        
        return pd.DataFrame(results)

    def visualize_sentiment_distribution(self, df: pd.DataFrame):
        """Create visualizations for sentiment distribution"""
        plt.figure(figsize=(15, 10))
        
        # VADER Compound Score Distribution
        plt.subplot(2, 2, 1)
        sns.histplot(data=df, x='vader_compound', bins=20)
        plt.title('VADER Compound Score Distribution')
        
        # TextBlob Polarity Distribution
        plt.subplot(2, 2, 2)
        sns.histplot(data=df, x='textblob_polarity', bins=20)
        plt.title('TextBlob Polarity Distribution')
        
        # Transformer Score Distribution
        plt.subplot(2, 2, 3)
        sns.countplot(data=df, x='transformer_label')
        plt.title('Transformer Label Distribution')
        
        plt.tight_layout()
        plt.savefig('sentiment_distribution.png')
        plt.close()

def main():
    # Example usage
    analyzer = SentimentAnalyzer()
    
    # Sample feedback
    feedback_examples = [
        "This product exceeded my expectations! Great quality and service.",
        "The customer support was terrible, I'm very disappointed.",
        "It's okay, nothing special but gets the job done.",
        "I love this product! Will definitely buy again!",
        "Waste of money, don't recommend it at all."
    ]
    
    # Analyze feedback
    results_df = analyzer.analyze_feedback(feedback_examples)
    
    # Display results
    print("\nAnalysis Results:")
    print(results_df[['text', 'vader_compound', 'textblob_polarity', 'transformer_label']])
    
    # Create visualizations
    analyzer.visualize_sentiment_distribution(results_df)
    print("\nVisualization saved as 'sentiment_distribution.png'")

if __name__ == "__main__":
    main() 