**ChessMaster**

A lightweight chess game with an AI opponent — built as a learning project to explore game logic, move generation, and simple AI techniques.

Summary

ChessMaster is a playable chess application that supports two modes:

Player vs AI (single-player)

Player vs Player (local two-player)

The AI is implemented using a classical search-based approach (e.g. Minimax with alpha-beta pruning / depth-limited search) and basic board evaluation. The project is intended for learning game programming and fundamentals of game-playing AI.

Features

Full chess rules (legal moves, castling, en passant, pawn promotion)

Move validation and check/checkmate detection

Undo last move

Simple AI opponent (configurable search depth/difficulty)

Text-based and/or GUI interface (choose what you implemented)

Tech Stack

Language: Python

Libraries: python-chess (optional), pygame (optional for GUI)

AI: Minimax + Alpha-Beta pruning (configurable depth); can be extended with heuristics or neural networks
