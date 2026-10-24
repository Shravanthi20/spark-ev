"""
SparkEV FedPer Neural Architecture
Implements the split network consisting of:
1. Shared Base Representation Layers (aggregated globally across EV fleet via FedAvg)
2. Personalized Head Layers (retained strictly locally on client edge device)
Lead: Gayathri U (CB.SC.U4CSE23026)
"""

import torch
import torch.nn as nn
from typing import Tuple


class FedPerBaseNetwork(nn.Module):
    """Shared feature representation network trained across the EV fleet."""
    def __init__(self, input_dim: int = 32, hidden_dim: int = 64):
        super(FedPerBaseNetwork, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.encoder(x)


class FedPerPersonalHead(nn.Module):
    """Personalized classification or regression head tuned to individual driver patterns."""
    def __init__(self, hidden_dim: int = 64, output_dim: int = 1):
        super(FedPerPersonalHead, self).__init__()
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim)
        )

    def forward(self, features: torch.Tensor) -> torch.Tensor:
        return self.head(features)


class SparkEVFedPerModel(nn.Module):
    """Unified composite model wrapping Base and Personal Head."""
    def __init__(self, input_dim: int = 32, hidden_dim: int = 64, output_dim: int = 1):
        super(SparkEVFedPerModel, self).__init__()
        self.base = FedPerBaseNetwork(input_dim, hidden_dim)
        self.head = FedPerPersonalHead(hidden_dim, output_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.base(x)
        return self.head(latent)

    def get_base_parameters(self):
        """Returns base parameters that participate in federated aggregation."""
        return self.base.state_dict()

    def set_base_parameters(self, state_dict):
        """Loads updated base parameters received from the federated server."""
        self.base.load_state_dict(state_dict)

    def get_personalized_parameters(self):
        """Returns local head parameters that remain strictly private on the vehicle."""
        return self.head.state_dict()
