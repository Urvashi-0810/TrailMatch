import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes import agent_bp

# Load environment variables
load_dotenv()

def create_app():
    """Flask app factory"""
    
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(agent_bp)
    
    # Root endpoint
    @app.route('/')
    def home():
        return jsonify({
            'message': 'Clinical Trial Matching Agentic AI API',
            'version': '1.0.0',
            'description': 'Agentic AI system that analyzes patient-trial matching using multiple specialized agents',
            'endpoints': {
                'health': '/api/agent/health',
                'analyze': '/api/agent/analyze (POST)',
                'docs': '/api/docs (if available)'
            },
            'agents': [
                'data_ingestion',
                'medical_analysis', 
                'trial_matching',
                'risk_assessment',
                'recommendation'
            ]
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=5000,
        # debug=app.config['DEBUG']
    )
