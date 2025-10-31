"""
Text Export Utilities
Export study plans and quizzes as formatted text files
"""

from datetime import datetime
from typing import Dict, List


def export_study_plan_as_text(study_plan: Dict, user_info: Dict, filename: str):
    """
    Export study plan as a formatted text file

    Args:
        study_plan: Study plan dict
        user_info: User information dict
        filename: Output filename
    """
    with open(filename, 'w', encoding='utf-8') as f:
        # Header
        f.write("="*70 + "\n")
        f.write(" " * 20 + "PERSONALIZED STUDY PLAN\n")
        f.write("="*70 + "\n\n")

        f.write(f"Student: {user_info['name']}\n")
        f.write(f"Email: {user_info['email']}\n")
        f.write(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}\n")
        f.write("\n" + "-"*70 + "\n\n")

        # Summary
        total_time = study_plan.get('total_estimated_minutes', 0)
        f.write(f"Total Estimated Study Time: {total_time} minutes (~{total_time//60}h {total_time%60}m)\n")
        f.write(f"Weak Topics to Study: {len(study_plan.get('weak_topics', []))}\n\n")

        f.write("="*70 + "\n\n")

        # Study steps
        for step in study_plan.get('steps', []):
            f.write(f"STEP {step['step']}: {step['topic'].upper()}\n")
            f.write(f"Priority: {step['priority']}\n")
            f.write(f"Current Score: {step['current_score']:.0f}%\n")
            f.write("-"*70 + "\n\n")

            # Display all resources (textbook + Khan Academy)
            resources = step.get('resources', [])

            if resources:
                f.write("STUDY RESOURCES:\n\n")

                for res in resources:
                    if res['type'] == 'textbook':
                        f.write("📖 TEXTBOOK READING:\n")
                        f.write(f"  Textbook: {res['source']}\n")
                        if res.get('section_number'):
                            f.write(f"  Section: {res['section_number']} - {res['section_title']}\n")
                        else:
                            f.write(f"  Section: {res['section_title']}\n")
                        f.write(f"  Pages: {res['page_start']}-{res['page_end']} ({res['page_count']} pages)\n")
                        f.write(f"  Time: ~{res['estimated_minutes']} minutes\n\n")

                    elif res['type'] == 'khan_academy':
                        f.write("🌐 KHAN ACADEMY:\n")
                        f.write(f"  Title: {res['title']}\n")
                        if res.get('url'):
                            f.write(f"  URL: {res['url']}\n")
                        f.write(f"  Time: ~{res['estimated_minutes']} minutes\n\n")

            f.write(f"⏱  Total Time for This Topic: {step.get('estimated_minutes', 0)} minutes\n")
            f.write("\n" + "="*70 + "\n\n")

        # Footer
        f.write("\n" + "-"*70 + "\n")
        f.write("NEXT STEPS:\n")
        f.write("1. Follow this study plan in order\n")
        f.write("2. Complete all readings and practice exercises\n")
        f.write("3. Take the verification quiz to confirm mastery\n")
        f.write("4. Review any questions you get wrong\n")
        f.write("\nGood luck with your studies!\n")
        f.write("-"*70 + "\n")


def export_quiz_as_text(quiz: Dict, user_info: Dict, filename: str):
    """
    Export verification quiz as a formatted text file

    Args:
        quiz: Quiz dict with questions
        user_info: User information dict
        filename: Output filename
    """
    with open(filename, 'w', encoding='utf-8') as f:
        # Header
        f.write("="*70 + "\n")
        f.write(" " * 20 + "VERIFICATION QUIZ\n")
        f.write("="*70 + "\n\n")

        f.write(f"Student: {user_info['name']}\n")
        f.write(f"Email: {user_info['email']}\n")
        f.write(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}\n")
        f.write(f"Quiz ID: {quiz.get('quiz_id', 'N/A')}\n")
        f.write("\n" + "-"*70 + "\n\n")

        # Instructions
        f.write("INSTRUCTIONS:\n")
        f.write("• This quiz tests your understanding of the weak topics identified\n")
        f.write("• Answer all 10 questions\n")
        f.write("• Choose the best answer for each question\n")
        f.write("• Check your answers at the end\n")
        f.write("\n" + "="*70 + "\n\n")

        # Questions
        questions = quiz.get('questions', [])

        for i, q in enumerate(questions, 1):
            f.write(f"QUESTION {i}\n")
            f.write(f"Topic: {q['topic']}\n")
            f.write(f"Difficulty: {q['difficulty']}\n")
            f.write("-"*70 + "\n\n")

            f.write(f"{q['stem']}\n\n")

            for j, option in enumerate(q['options']):
                f.write(f"  {chr(65+j)}. {option}\n")

            f.write("\n" + "="*70 + "\n\n")

        # Answer key (at the end)
        f.write("\n" + "="*70 + "\n")
        f.write(" " * 25 + "ANSWER KEY\n")
        f.write("="*70 + "\n\n")

        for i, q in enumerate(questions, 1):
            correct_letter = chr(65 + q['answerIndex'])
            correct_answer = q['options'][q['answerIndex']]

            f.write(f"Question {i}: {correct_letter}\n")
            f.write(f"  Answer: {correct_answer}\n")
            f.write(f"  Explanation: {q['rationale']}\n\n")

        # Footer
        f.write("-"*70 + "\n")
        f.write("\nSCORING:\n")
        f.write("• 9-10 correct: Excellent! You've mastered these topics.\n")
        f.write("• 7-8 correct: Good! Review the questions you missed.\n")
        f.write("• 5-6 correct: Fair. Review the study materials again.\n")
        f.write("• Below 5: Needs more study. Go through the study plan carefully.\n")
        f.write("-"*70 + "\n")
