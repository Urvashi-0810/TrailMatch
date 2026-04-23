import sys
sys.path.append('.')

from agents.report_agent import ReportAgent
import asyncio

async def test_report_agent():
    agent = ReportAgent()
    patient_id = 'patient-123'
    matching_results = {'matches': [], 'success': True}
    explanations = {'explanations': []}
    profile = {'age': 50, 'conditions': ['hypertension']}

    result = await agent.generate_report(
        patient_id,
        matching_results,
        explanations,
        patient_profile=profile,
        include_pdf=True
    )

    print('Report generation result:')
    print('Success:', result['success'])
    print('Report ID:', result['report_id'])
    print('Report JSON keys:', list(result['report_json'].keys()))
    if 'pdf_data' in result:
        print('PDF stub present:', result['pdf_data'])

    info = agent.__dict__
    print('\nAgent info:', info)

if __name__ == '__main__':
    asyncio.run(test_report_agent())
