from flask import Blueprint, request, jsonify
import base64
import asyncio
from orchestrator.orchestrator import get_orchestrator
from models.schemas import PatientDataInput

agent_bp = Blueprint('agent', __name__, url_prefix='/api/agent')


# -----------------------------
# HEALTH CHECK
# -----------------------------
@agent_bp.route('/health', methods=['GET'])
def health_check():

    return jsonify({
        'status': 'ok',
        'message': 'Clinical Trial Matching Agentic AI service is running'
    })


# -----------------------------
# AGENTS INFO
# -----------------------------
@agent_bp.route('/agents', methods=['GET'])
def agents_info():

    orchestrator = get_orchestrator()

    return jsonify({
        "agents": orchestrator.get_all_agents_info()
    })


# -----------------------------
# MAIN ANALYSIS ENDPOINT
# -----------------------------
@agent_bp.route('/analyze', methods=['POST'])
def analyze_patient_trials():

    try:

        # -----------------------------
        # FILE INPUT (PDF / IMAGE / EXCEL)
        # -----------------------------
        if 'file' in request.files:

            uploaded_file = request.files['file']

            if uploaded_file.filename == '':
                return jsonify({"error": "Empty filename"}), 400

            file_bytes = uploaded_file.read()

            encoded_content = base64.b64encode(file_bytes).decode()

            filename = uploaded_file.filename.lower()

            if filename.endswith(".pdf"):
                data_type = "pdf"

            elif filename.endswith(".png") or filename.endswith(".jpg") or filename.endswith(".jpeg"):
                data_type = "image"

            elif filename.endswith(".xlsx") or filename.endswith(".xls"):
                data_type = "excel"

            else:
                return jsonify({"error": "Unsupported file type"}), 400

            patient_obj = PatientDataInput(
                data_type=data_type,
                content=encoded_content
            )

        # -----------------------------
        # JSON INPUT (STRUCTURED DATA)
        # -----------------------------
        else:

            data = request.get_json(silent=True)

            if not data:
                return jsonify({"error": "No input provided"}), 400

            patient_data = data.get("patient_data")

            if not patient_data:
                return jsonify({"error": "patient_data missing"}), 400

            patient_obj = PatientDataInput(**patient_data)

        # -----------------------------
        # RUN ORCHESTRATOR
        # -----------------------------
        orchestrator = get_orchestrator()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        result = loop.run_until_complete(
            orchestrator.execute_workflow(
                patient_obj,
                include_explanation=True,
                generate_pdf=False
            )
        )

        loop.close()

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
