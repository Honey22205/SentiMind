from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sentiment_analyzer import SentimentAnalyzer
import json
import os
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize our sentiment analyzer
analyzer = SentimentAnalyzer()

@app.route('/')
def serve_frontend():
    return app.send_static_file('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return app.send_static_file(filename)

@app.route('/api/analyze', methods=['POST'])
def analyze_feedback():
    try:
        logger.info("Received analyze request")
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        if not data or 'feedback' not in data:
            logger.error("No feedback provided in request")
            return jsonify({'error': 'No feedback provided'}), 400

        feedback_list = data['feedback']
        if not isinstance(feedback_list, list):
            feedback_list = [feedback_list]

        logger.info(f"Processing feedback list: {feedback_list}")

        # Analyze the feedback
        results_df = analyzer.analyze_feedback(feedback_list)
        
        # Convert DataFrame to dictionary for JSON response
        results = results_df.to_dict(orient='records')
        
        # Generate visualization if multiple feedback items
        if len(feedback_list) > 1:
            analyzer.visualize_sentiment_distribution(results_df)
            
        response_data = {
            'results': results,
            'visualization_available': len(feedback_list) > 1
        }
        logger.info(f"Sending response: {response_data}")
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error processing feedback: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Error processing feedback',
            'details': str(e)
        }), 500

@app.route('/api/visualization')
def get_visualization():
    try:
        return send_file('sentiment_distribution.png', 
                        mimetype='image/png',
                        as_attachment=False)
    except Exception as e:
        logger.error(f"Error serving visualization: {str(e)}")
        return jsonify({'error': 'Visualization not available'}), 404

# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     logger.info(f"Starting server on port {port}")
#     app.run(host='0.0.0.0', port=port, debug=True) 


# import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render assigns a dynamic port
    app.run(host="0.0.0.0", port=port)

