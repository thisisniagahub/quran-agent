"""
Inter-rater Reliability Assessment for Quran Teaching AI Agent
Comparison with certified Quran teachers and scholars
"""

import numpy as np
from typing import List, Dict, Tuple, Any
from scipy.stats import cohen_kappa, pearsonr
import pandas as pd


class InterRaterReliability:
    def __init__(self):
        self.teacher_ratings = []
        self.ai_ratings = []
    
    def calculate_cohen_kappa(self, teacher_ratings: List[int], 
                            ai_ratings: List[int]) -> float:
        """
        Calculate Cohen's Kappa for agreement between teacher and AI ratings
        Target: > 0.8 for acceptable agreement
        """
        from sklearn.metrics import cohen_kappa_score
        return cohen_kappa_score(teacher_ratings, ai_ratings)
    
    def calculate_pearson_correlation(self, teacher_ratings: List[float], 
                                   ai_ratings: List[float]) -> Tuple[float, float]:
        """
        Calculate Pearson correlation between teacher and AI scores
        Target: r > 0.85 for strong correlation
        """
        correlation, p_value = pearsonr(teacher_ratings, ai_ratings)
        return correlation, p_value
    
    def calculate_fleiss_kappa(self, ratings_matrix: List[List[int]]) -> float:
        """
        Calculate Fleiss' Kappa for multiple raters
        ratings_matrix: [[rater1_scores], [rater2_scores], ...]
        """
        n_raters = len(ratings_matrix)
        n_items = len(ratings_matrix[0])
        
        # Calculate proportion of each category for each item
        categories = set()
        for rater_ratings in ratings_matrix:
            categories.update(rater_ratings)
        categories = sorted(list(categories))
        
        # Calculate Fleiss' Kappa
        # Implementation based on standard Fleiss' Kappa formula
        n_categories = len(categories)
        
        # Create matrix of category counts for each item
        category_counts = np.zeros((n_items, n_categories))
        for i in range(n_items):
            for j, category in enumerate(categories):
                category_counts[i][j] = sum(1 for rater in ratings_matrix 
                                          if rater[i] == category)
        
        # Calculate proportions
        pi = np.zeros(n_categories)
        for j in range(n_categories):
            pi[j] = sum(category_counts[i][j] for i in range(n_items)) / (n_raters * n_items)
        
        # Calculate P_i for each item
        P_i = np.zeros(n_items)
        for i in range(n_items):
            P_i[i] = sum(category_counts[i][j] * (category_counts[i][j] - 1) 
                        for j in range(n_categories)) / (n_raters * (n_raters - 1))
        
        P_bar = np.mean(P_i)
        P_e = sum(pj * pj for pj in pi)
        
        if P_e == 1.0:
            return 1.0 if P_bar == 1.0 else 0.0
        
        kappa = (P_bar - P_e) / (1 - P_e)
        return kappa
    
    def assess_teacher_agreement(self, teacher_data: List[Dict]) -> Dict:
        """
        Assess agreement between multiple certified Quran teachers
        teacher_data: List of dicts with teacher ratings for same samples
        """
        if len(teacher_data) < 2:
            raise ValueError("Need at least 2 teachers for agreement assessment")
        
        # Extract ratings from different teachers for same samples
        teacher_ratings_matrix = []
        for teacher_id, ratings in teacher_data.items():
            teacher_ratings_matrix.append(ratings)
        
        fleiss_kappa = self.calculate_fleiss_kappa(teacher_ratings_matrix)
        
        return {
            'fleiss_kappa': fleiss_kappa,
            'n_teachers': len(teacher_data),
            'agreement_level': self._interpret_kappa(fleiss_kappa)
        }
    
    def assess_ai_teacher_agreement(self, teacher_ratings: List[float], 
                                  ai_ratings: List[float]) -> Dict:
        """
        Assess agreement between AI system and certified teachers
        """
        # Calculate Cohen's Kappa
        kappa = self.calculate_cohen_kappa(
            [int(r) for r in teacher_ratings], 
            [int(r) for r in ai_ratings]
        )
        
        # Calculate Pearson correlation
        correlation, p_value = self.calculate_pearson_correlation(
            teacher_ratings, ai_ratings
        )
        
        return {
            'cohen_kappa': kappa,
            'pearson_correlation': correlation,
            'p_value': p_value,
            'agreement_level': self._interpret_kappa(kappa),
            'correlation_strength': self._interpret_correlation(correlation)
        }
    
    def _interpret_kappa(self, kappa: float) -> str:
        """Interpret kappa value"""
        if kappa >= 0.8:
            return "Excellent agreement"
        elif kappa >= 0.6:
            return "Good agreement"
        elif kappa >= 0.4:
            return "Moderate agreement"
        elif kappa >= 0.2:
            return "Fair agreement"
        else:
            return "Poor agreement"
    
    def _interpret_correlation(self, correlation: float) -> str:
        """Interpret correlation strength"""
        abs_corr = abs(correlation)
        if abs_corr >= 0.85:
            return "Very strong correlation"
        elif abs_corr >= 0.7:
            return "Strong correlation"
        elif abs_corr >= 0.5:
            return "Moderate correlation"
        elif abs_corr >= 0.3:
            return "Weak correlation"
        else:
            return "Very weak correlation"
    
    def generate_validation_report(self, validation_data: Dict) -> Dict:
        """
        Generate comprehensive validation report
        validation_data should contain:
        - teacher_ratings: List of ratings from certified teachers
        - ai_ratings: List of ratings from AI system
        - multiple_teacher_ratings: Dict of ratings from multiple teachers
        """
        report = {
            'validation_date': '2024-01-15',
            'sample_size': len(validation_data.get('teacher_ratings', [])),
            'teacher_agreement': None,
            'ai_teacher_agreement': None,
            'validation_metrics': {}
        }
        
        # Assess agreement between multiple teachers
        if 'multiple_teacher_ratings' in validation_data:
            teacher_agreement = self.assess_teacher_agreement(
                validation_data['multiple_teacher_ratings']
            )
            report['teacher_agreement'] = teacher_agreement
        
        # Assess AI-teacher agreement
        if ('teacher_ratings' in validation_data and 
            'ai_ratings' in validation_data):
            ai_teacher_agreement = self.assess_ai_teacher_agreement(
                validation_data['teacher_ratings'],
                validation_data['ai_ratings']
            )
            report['ai_teacher_agreement'] = ai_teacher_agreement
            
            # Add validation metrics
            report['validation_metrics'] = {
                'target_cohen_kappa': 0.8,
                'achieved_cohen_kappa': ai_teacher_agreement['cohen_kappa'],
                'target_correlation': 0.85,
                'achieved_correlation': ai_teacher_agreement['pearson_correlation'],
                'validation_passed': (
                    ai_teacher_agreement['cohen_kappa'] >= 0.8 and
                    ai_teacher_agreement['pearson_correlation'] >= 0.85
                )
            }
        
        return report


# Example usage and validation
def run_validation_study():
    """
    Run a validation study with certified Quran teachers
    """
    reliability = InterRaterReliability()
    
    # Simulated validation data
    # In real implementation, this would come from actual teacher assessments
    validation_data = {
        'teacher_ratings': [4.2, 3.8, 4.5, 3.2, 4.0, 3.9, 4.3, 3.7, 4.1, 3.6],
        'ai_ratings': [4.0, 3.9, 4.4, 3.3, 3.9, 4.0, 4.2, 3.6, 4.0, 3.7],
        'multiple_teacher_ratings': {
            'teacher_1': [4, 4, 5, 3, 4, 4, 4, 4, 4, 4],
            'teacher_2': [4, 4, 4, 3, 4, 4, 4, 3, 4, 4],
            'teacher_3': [4, 4, 5, 3, 4, 4, 4, 4, 4, 3]
        }
    }
    
    report = reliability.generate_validation_report(validation_data)
    
    print("Quran Teaching AI - Validation Report")
    print("=" * 50)
    print(f"Sample Size: {report['sample_size']}")
    print(f"Teacher Agreement (Fleiss' Kappa): {report['teacher_agreement']['fleiss_kappa']:.3f}")
    print(f"AI-Teacher Agreement (Cohen's Kappa): {report['ai_teacher_agreement']['cohen_kappa']:.3f}")
    print(f"Pearson Correlation: {report['ai_teacher_agreement']['pearson_correlation']:.3f}")
    print(f"Validation Passed: {report['validation_metrics']['validation_passed']}")
    
    return report


if __name__ == "__main__":
    report = run_validation_study()