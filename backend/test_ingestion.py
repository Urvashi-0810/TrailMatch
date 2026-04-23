import sys
sys.path.append('.')

from agents.ingestion_agent import IngestionAgent
from models.schemas import PatientDataInput
import asyncio

async def test_ingestion():
    agent = IngestionAgent()

    # Test JSON data
    json_content = '{"age": 45, "conditions": ["diabetes"]}'
    json_data = PatientDataInput(
        data_type='json',
        content=json_content
    )

    result = await agent.ingest_patient_data(json_data)
    print('JSON ingestion result:')
    print('Success:', result['success'])
    if result['success']:
        print('Raw data keys:', list(result['raw_data'].keys()))
        print('Content:', result['raw_data']['content'])

    # Test agent info
    info = agent.get_info()
    print('\nAgent info:', info)

if __name__ == "__main__":
    asyncio.run(test_ingestion())