import React from 'react';
import { Choice } from '../types';

interface ChoiceWithStatus extends Choice {
    status?: 'unavailable';
}

interface ChoiceButtonProps {
  choice: ChoiceWithStatus;
  onChoose: (choice: Choice) => void;
  disabled: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onChoose, disabled }) => {
  const isUnavailable = choice.status === 'unavailable';
  const buttonText = isUnavailable ? `[Path Unavailable] ${choice.text}` : choice.text;

  return (
    <button
      onClick={() => onChoose(choice)}
      disabled={disabled || isUnavailable}
      className={`
        font-semibold py-3 px-5 rounded-lg transition-all duration-300 ease-in-out text-left w-full shadow-md border
        flex flex-col
        ${isUnavailable
          ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-80'
          : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 transform hover:scale-105 hover:shadow-lg'
        }
        disabled:transform-none disabled:shadow-sm disabled:hover:border-gray-300 disabled:bg-gray-100/50 disabled:text-gray-500 disabled:cursor-not-allowed
      `}
    >
      <span className="block text-gray-800">{buttonText}</span>
      
      {(!isUnavailable && (choice.effect || choice.potentialReward)) && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs font-normal space-y-1.5">
            {choice.effect && (
                <div className="flex items-center gap-1.5 text-blue-600 italic">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>{choice.effect}</span>
                </div>
            )}
            {choice.potentialReward && (
                <div className="flex items-center gap-1.5 text-green-700 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
                      <path d="M3 9a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <span>{choice.potentialReward}</span>
                </div>
            )}
        </div>
      )}
    </button>
  );
};