import Board from './Board';
import Piece from './pieces/Piece';
import { parseId, iterateOver2DArray } from './utils';


class Game {
  constructor() {
    this.currentPlayer = 'white';
    this.round = 0;
    this.board = new Board();
    this.gameArea = this.board.gameArea;
    this.legalMoves = [];
    this.selectedPiece = null;
    this.board.gameAreaHandler.addEventListener('click', e => this.onClick(e));

  }

  onClick(e) {
    const element = e.target.classList.contains('square') ? e.target : e.target.parentElement;

    const { id } = element;
    if (this.possibleMoves.length !== 0) {
      if (this.possibleMoves.includes(id)) this.handleMove(element);
      else this.removeSelection();

    } else {
      this.handleSelect(element);
    }
  }
  removeSelection() {
    this.board.removeHighlight();
    this.selectedPiece = null;
    this.possibleMoves = [];
  }
  changeTurn() {
    if (this.round % 2 === 0) this.currentPlayer = 'black';
    if (this.round % 2 === 1) this.currentPlayer = 'white';
    this.round++;
  }

  handleSelect(element) {
    const [x, y] = parseId(element.id);

    if (!this.gameArea[x][y] || this.gameArea[x][y].side !== this.currentPlayer) return;

    this.selectedPiece = this.gameArea[x][y];
    const possibleMoves = this.selectedPiece.findLegalMoves(this.gameArea);

    if (this.selectedPiece.name === 'king' && !this.isChecked())
      possibleMoves.push(...this.selectedPiece.castling(this.gameArea, {}));


    this.legalMoves = possibleMoves.filter(move => {
      const suspectedGameState = this.board.tryPieceMove(this.selectedPiece, parseId(move));
      return !this.isChecked(suspectedGameState);
    });
    this.board.highlightPossibleMoves(this.legalMoves);
  }

  handleMove(element) {
    const { id } = element;
    if (!this.selectedPiece.findLegalMoves(this.gameArea).includes(id)) return;
    this.board.movePiece(this.selectedPiece, parseId(id));
    this.board.removeHighlight();
    this.selectedPiece = null;
    this.legalMoves = [];
    this.changeTurn();
    if (this.isChecked()) {
      this.board.lightUpCheck(this.getKingPosition(this.gameArea));
      if (this.isCheckMate()) setTimeout(gameArea => this.endGame(gameArea), 1200);
    }
    this.isPat();
  }

  endGame(gameArea = this.gameArea) {
    this.board.changeSquareStyle(
      this.getKingPosition(this.gameArea).x.toString() + this.getKingPosition(this.gameArea).y.toString(),
      'square check',
    );
    alert('Szach i Mat');
  }

  isChecked(gameArea = this.gameArea) {
    const king = this.getKingPosition(gameArea);
    const opponentMoves = this.getPlayerMoves(this.currentPlayer === 'white' ? 'black' : 'white', gameArea);
    return opponentMoves.some(move => move[0] == king.x && move[2] == king.y) ? true : false;
  }

  isCheckMate(gameArea = this.gameArea) {
    const currentPlayerPieces = this.getPlayerPieces(this.currentPlayer, gameArea);
    return currentPlayerPieces.every(piece =>
      piece.findLegalMoves(gameArea).every(move => {
        const suspectedGameState = this.board.tryPieceMove(piece, parseId(move));
        return this.isChecked(suspectedGameState);
      }),
    );
  }

  isPat(gameArea = this.gameArea) {
    const opponentMoves = this.getPlayerMoves(this.currentPlayer === 'white' ? 'white' : 'black', gameArea);
    if (!this.isChecked() && opponentMoves.length == 0) {
      console.log('PAT');

      this.board.changeSquareStyle(
        this.getKingPosition(this.gameArea).x.toString() + this.getKingPosition(this.gameArea).y.toString(),
        'square pat',
      );
    }
  }

  getKingPosition(gameArea = this.gameArea, player = this.currentPlayer) {
    const king = {};
    iterateOver2DArray((piece, x, y) => {
      if (piece && piece.side === player && piece.name === 'king') {
        king.x = x;
        king.y = y;
      }
    }, gameArea);
    return king;
  }

  getPlayerPieces(player, gameArea = this.gameArea) {
    return gameArea.flat().filter(piece => piece && piece.side === player);
  }

  getPlayerMoves(player, gameArea = this.gameArea) {
    const pieces = this.getPlayerPieces(player, gameArea);
    return pieces.map(piece => piece.findLegalMoves(gameArea)).flat();
  }
}

export default Game;
