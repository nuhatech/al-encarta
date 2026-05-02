"use client";
import { useEffect, useMemo, useState } from "react";
import {
  countFlags,
  DEFAULT_OPTIONS,
  emptyBoard,
  isWon,
  placeMinesAvoiding,
  revealAllMines,
  revealCell,
  toggleFlag,
  type Board,
  type GameState,
} from "./minesweeper/game";
import { HormuzMap } from "./minesweeper/HormuzMap";
import { unlockHormuz, isHormuzUnlocked } from "./minesweeper/unlock";

const NUMBER_COLORS: Record<number, string> = {
  1: "#1976d2",
  2: "#388e3c",
  3: "#d32f2f",
  4: "#7b1fa2",
  5: "#5d4037",
  6: "#0097a7",
  7: "#000000",
  8: "#757575",
};

export function MinesweeperApp() {
  const [board, setBoard] = useState<Board>(() =>
    emptyBoard(DEFAULT_OPTIONS.rows, DEFAULT_OPTIONS.cols),
  );
  const [state, setState] = useState<GameState>("ready");
  const [showReveal, setShowReveal] = useState(false);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffect(() => {
    setAlreadyUnlocked(isHormuzUnlocked());
  }, []);

  const flagsLeft = useMemo(
    () => DEFAULT_OPTIONS.mines - countFlags(board),
    [board],
  );

  const handleClick = (r: number, c: number) => {
    if (state === "lost" || state === "won") return;
    const cell = board[r]?.[c];
    if (!cell || cell.revealed || cell.flagged) return;

    let nextBoard = board;
    if (state === "ready") {
      // Generate mines on first click, avoiding the clicked area.
      nextBoard = placeMinesAvoiding(
        DEFAULT_OPTIONS.rows,
        DEFAULT_OPTIONS.cols,
        DEFAULT_OPTIONS.mines,
        r,
        c,
      );
      setState("playing");
    }
    nextBoard = revealCell(nextBoard, r, c);

    const clickedCell = nextBoard[r]?.[c];
    if (clickedCell?.hasMine) {
      // Game over — reveal all mines.
      setBoard(revealAllMines(nextBoard));
      setState("lost");
      return;
    }

    if (isWon(nextBoard)) {
      setBoard(nextBoard);
      setState("won");
      unlockHormuz();
      setShowReveal(true);
      return;
    }

    setBoard(nextBoard);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (state === "lost" || state === "won") return;
    setBoard(toggleFlag(board, r, c));
  };

  const reset = () => {
    setBoard(emptyBoard(DEFAULT_OPTIONS.rows, DEFAULT_OPTIONS.cols));
    setState("ready");
    setShowReveal(false);
  };

  const faceEmoji = state === "won" ? "😎" : state === "lost" ? "😵" : "🙂";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--y2k-window)",
        padding: 8,
        gap: 8,
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <Toolbar
        flagsLeft={flagsLeft}
        face={faceEmoji}
        onReset={reset}
        state={state}
        unlocked={alreadyUnlocked || state === "won"}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          border: "inset 2px",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <HormuzMap />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${DEFAULT_OPTIONS.cols}, 1fr)`,
            gridTemplateRows: `repeat(${DEFAULT_OPTIONS.rows}, 1fr)`,
            gap: 1,
            width: "100%",
            height: "100%",
            padding: 4,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <Tile
                key={`${r}:${c}`}
                cell={cell}
                onClick={() => handleClick(r, c)}
                onRightClick={(e) => handleRightClick(e, r, c)}
                gameOver={state === "lost"}
              />
            )),
          )}
        </div>
      </div>

      {showReveal && <ManuscriptReveal onClose={() => setShowReveal(false)} />}
    </div>
  );
}

interface ToolbarProps {
  flagsLeft: number;
  face: string;
  onReset: () => void;
  state: GameState;
  unlocked: boolean;
}

function Toolbar({ flagsLeft, face, onReset, state, unlocked }: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        background: "var(--y2k-window)",
        border: "outset 2px",
        fontSize: 12,
      }}
    >
      <div
        style={{
          background: "#000",
          color: "#ff2222",
          fontFamily: "'Courier New', monospace",
          fontSize: 18,
          fontWeight: 700,
          padding: "1px 6px",
          minWidth: 48,
          textAlign: "center",
        }}
      >
        {String(flagsLeft).padStart(3, "0")}
      </div>

      <button
        onClick={onReset}
        style={{
          fontSize: 22,
          width: 32,
          height: 32,
          padding: 0,
          lineHeight: 1,
        }}
        title="Recommencer"
      >
        {face}
      </button>

      <div
        style={{
          fontSize: 11,
          color: state === "won" ? "#2a7d2a" : state === "lost" ? "#a00" : "#222",
          fontWeight: 700,
        }}
      >
        {state === "ready" && "Cliquez pour commencer"}
        {state === "playing" && "🚢 Détroit ouvert au commerce"}
        {state === "lost" && "💥 Tanker touché — commerce perturbé"}
        {state === "won" && "✓ Détroit sécurisé"}
        {unlocked && state !== "won" && (
          <span style={{ marginLeft: 6, color: "#888", fontWeight: 400 }}>
            (déjà débloqué)
          </span>
        )}
      </div>
    </div>
  );
}

interface TileProps {
  cell: Board[number][number];
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  gameOver: boolean;
}

function Tile({ cell, onClick, onRightClick, gameOver }: TileProps) {
  const baseStyle: React.CSSProperties = {
    border: "outset 2px",
    background: "rgba(192, 192, 192, 0.85)",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 14,
    padding: 0,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (cell.revealed) {
    if (cell.hasMine) {
      return (
        <button
          style={{
            ...baseStyle,
            border: "inset 2px",
            background: "rgba(220, 60, 60, 0.85)",
            cursor: "default",
          }}
        >
          💣
        </button>
      );
    }
    return (
      <button
        style={{
          ...baseStyle,
          border: "inset 1px",
          background: "rgba(220, 220, 220, 0.55)",
          color: NUMBER_COLORS[cell.adjacent] ?? "#000",
          cursor: "default",
        }}
      >
        {cell.adjacent > 0 ? cell.adjacent : ""}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onContextMenu={onRightClick}
      disabled={gameOver}
      style={baseStyle}
    >
      {cell.flagged ? "🚩" : ""}
    </button>
  );
}

function ManuscriptReveal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.55)",
        zIndex: 10,
      }}
    >
      <div
        className="window"
        style={{
          width: "min(480px, 90%)",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">📜 Manuscrit retrouvé</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 18,
            background: "#fdf6e3",
            fontFamily: "Georgia, serif",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#3a2a10",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 10,
              fontSize: 18,
              color: "#000080",
              fontFamily: "Georgia, serif",
            }}
          >
            Vous avez sécurisé le détroit.
          </h2>
          <p style={{ margin: 0, marginBottom: 10, fontStyle: "italic" }}>
            Voici ce que rappellent les chroniques d&apos;Oman et les portulans
            de l&apos;océan Indien :
          </p>
          <p style={{ margin: 0, marginBottom: 10 }}>
            Le détroit d&apos;Ormuz a vu passer Ibn Battuta en{" "}
            <strong>1330</strong>, qui en décrivit les courants traîtres dans sa
            Rihla ; Ahmad ibn Majid en cartographia les passages mortels au{" "}
            <strong>15ème siècle</strong> ; et lorsque les Portugais s&apos;y
            installèrent en 1507 sous Albuquerque, c&apos;est{" "}
            <strong>l&apos;Imam Nasir bin Murshid Al Ya&apos;rubi</strong>,
            fondateur de la dynastie omanaise des Ya&apos;rubi, qui lança en{" "}
            <strong>1624</strong> la guerre de libération.
          </p>
          <p style={{ margin: 0, marginBottom: 10 }}>
            Son successeur Sultan bin Saif acheva l&apos;œuvre en chassant les
            Portugais de Mascate en <strong>1650</strong>. Pendant deux
            siècles, les Ya&apos;rubi tinrent l&apos;océan Indien des côtes
            d&apos;Oman jusqu&apos;à Zanzibar.
          </p>
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "rgba(0, 0, 128, 0.07)",
              border: "1px dashed #000080",
              fontFamily: "Tahoma, sans-serif",
              fontSize: 12,
              color: "#000080",
            }}
          >
            🎉 <strong>Personnage caché débloqué :</strong>
            <br />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 14 }}>
              Imam Nasir bin Murshid Al Ya&apos;rubi
            </span>
            <br />
            <small>
              Disponible dans le catalogue Encarta sous la lettre &laquo;&nbsp;I&nbsp;&raquo;.
            </small>
          </div>
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <button onClick={onClose} style={{ minWidth: 100, fontWeight: 700 }}>
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
