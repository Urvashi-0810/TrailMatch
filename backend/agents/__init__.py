"""
Clinical Trial Engine - Agents Module

Multi-agent architecture for clinical trial eligibility matching.
Each agent specializes in a specific task in the patient-trial matching pipeline.
"""

# Import agents with error handling for missing dependencies
try:
    from agents.ingestion_agent import IngestionAgent
except ImportError:
    IngestionAgent = None

try:
    from agents.extraction_agent import MedicalExtractionAgent
except ImportError:
    MedicalExtractionAgent = None

try:
    from agents.anonymization_agent import AnonymizationAgent
except ImportError:
    AnonymizationAgent = None

try:
    from agents.trial_parser_agent import TrialParserAgent
except ImportError:
    TrialParserAgent = None

try:
    from agents.matching_agent import MatchingAgent
except ImportError:
    MatchingAgent = None

try:
    from agents.explanation_agent import ExplanationAgent
except ImportError:
    ExplanationAgent = None

try:
    from agents.report_agent import ReportAgent
except ImportError:
    ReportAgent = None

try:
    from agents.web_scraping_agent import WebScrapingAgent
except ImportError:
    WebScrapingAgent = None

__all__ = [
    "MedicalExtractionAgent",
    "AnonymizationAgent",
    "TrialParserAgent",
    "MatchingAgent",
    "ExplanationAgent",
    "ReportAgent",
    "WebScrapingAgent",
]
