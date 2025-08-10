

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scene, Choice, PlayerStats, PlayerLoadout, CustomizationOptions, PlayerInventory, Item, CrewMember, Ability, OriginSea, DevilFruit } from './types';
import { startStory, advanceStory, QuotaError, regenerateChoices } from './services/geminiService';
import { StoryDisplay } from './components/StoryDisplay';
import { ChoiceButton } from './components/ChoiceButton';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { StatsPage } from './components/StatsPage';
import { CustomizationPage } from './components/CustomizationPage';

interface DisplayChoice extends Choice {
  status?: 'unavailable';
}

interface DisplayScene {
  story: string;
  choices: DisplayChoice[];
}

const pirateInitialStats: PlayerStats = {
    Agility: 8, Strength: 7, ConquerorsHaki: 6, HakiControl: 5,
    Willpower: 8, Endurance: 7, Intelligence: 4,
    Beli: 50000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};

const marineInitialStats: PlayerStats = {
    Agility: 6, Strength: 6, ConquerorsHaki: 7, HakiControl: 6,
    Willpower: 6, Endurance: 8, Intelligence: 6,
    Beli: 100000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};

const revolutionaryInitialStats: PlayerStats = {
    Agility: 7, Strength: 5, ConquerorsHaki: 6, HakiControl: 7,
    Willpower: 9, Endurance: 6, Intelligence: 8,
    Beli: 75000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};

const celestialDragonInitialStats: PlayerStats = {
    Agility: 2, Strength: 2, ConquerorsHaki: 8, HakiControl: 2,
    Willpower: 5, Endurance: 3, Intelligence: 4,
    Beli: 10000000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};

const swordsmanInitialStats: PlayerStats = {
    Agility: 8, Strength: 8, ConquerorsHaki: 5, HakiControl: 6,
    Willpower: 8, Endurance: 7, Intelligence: 3,
    Beli: 40000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};

const cipherPolInitialStats: PlayerStats = {
    Agility: 9, Strength: 5, ConquerorsHaki: 1, HakiControl: 8,
    Willpower: 7, Endurance: 6, Intelligence: 9,
    Beli: 200000, Bounty: 0, DevilFruitMastery: 1,
    ObservationHaki: 1, ArmamentHaki: 1,
};


const initialInventory: PlayerInventory = {
    outfits: [],
    weapons: [],
    titles: [],
    abilities: [],
};

const staticCustomizationOptions: CustomizationOptions = {
    outfits: [
      { name: "White Shirt and Cape", description: "A crisp white shirt and a flowing cape, the attire of a confident and formidable leader. Paired with fine slacks and a matching hat, it projects both elegance and power." },
      { name: "Pirate Captain's Coat", description: "A long, imposing coat and a matching captain's hat, often worn to show off one's fearsome reputation. A symbol of command on the high seas." },
      { name: "Marine Coat and Suit", description: "A pristine white suit paired with a long Marine coat draped over the shoulders, bearing the emblem of 'Justice'. This high-ranking attire projects an aura of absolute authority." },
      { name: "Wano Country Kimono", description: "An elegant, traditional kimono from an isolated, powerful land. Perfect for a wandering swordsman." },
      { name: "Revolutionary's Cloak", description: "A dark, hooded cloak that conceals one's identity. The attire of those who move in the shadows to change the world." },
      { name: "Classic Suit and Coat", description: "A sharp, tailored suit paired with a long coat, suitable for an influential figure operating in the shadows or in plain sight." },
    ],
    weapons: [
      { name: "None", description: "Rely on your own strength and martial prowess. Who needs weapons?", grade: "Ungraded" },
      { name: "Nodachi", description: "A greatsword with a long, sweeping blade. It requires immense strength to wield but delivers devastating cuts.", grade: "Ungraded" },
      { name: "Flintlock Pistols", description: "A pair of reliable, single-shot pistols. A common sight in the world of pirates, effective at a distance.", grade: "Ungraded" },
      { name: "Saber", description: "A curved blade favored by many naval officers and pirates alike, excellent for swift slashes.", grade: "Ungraded" },
      { name: "Katana", description: "A classic single-edged sword from Wano, known for its sharpness and precision. Favored by samurai.", grade: "Ungraded" },
      { name: "Clima-Tact Prototype", description: "A strange, three-sectioned staff capable of creating small, localized weather phenomena. Complex, but full of potential.", grade: "Ungraded" },
      { name: "Bisento", description: "A massive polearm with a heavy, curved blade, reminiscent of the weapon wielded by the strongest man in the world. It delivers immense, crushing force.", grade: "Ungraded" },
      { name: "Clubbed Mace", description: "A heavy, brutal weapon. It lacks finesse but delivers crushing blows capable of shattering bone and steel.", grade: "Ungraded" },
    ]
};

const SAVE_KEY = 'onePieceAdventureSave';

type SystemMessage = string | { title: string; items: string[] };

const App: React.FC = () => {
    const [view, setView] = useState<'customization' | 'game' | 'stats'>('customization');
    const [scene, setScene] = useState<DisplayScene | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStats>(pirateInitialStats);
    const [playerLoadout, setPlayerLoadout] = useState<PlayerLoadout | null>(null);
    const [playerInventory, setPlayerInventory] = useState<PlayerInventory>(initialInventory);
    const [crew, setCrew] = useState<CrewMember[]>([]);
    const [reputationAnalysis, setReputationAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storyKey, setStoryKey] = useState<number>(0);
    const [choicesKey, setChoicesKey] = useState<number>(0);
    const [majorEncounter, setMajorEncounter] = useState<{ name: string; description: string; } | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
    const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
    const [hasSaveFile, setHasSaveFile] = useState<boolean>(false);
    const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);
    const [lastAttemptedChoice, setLastAttemptedChoice] = useState<Choice | null>(null);

    const systemMessageTimeoutRef = useRef<number | null>(null);
    const titleText = "World Chronicles";

    const showSystemMessage = useCallback((message: SystemMessage, duration: number = 3000) => {
        if (systemMessageTimeoutRef.current) {
            clearTimeout(systemMessageTimeoutRef.current);
        }
        setSystemMessage(message);
        systemMessageTimeoutRef.current = window.setTimeout(() => {
            setSystemMessage(null);
            systemMessageTimeoutRef.current = null;
        }, duration);
    }, []);

    useEffect(() => {
        const savedGame = localStorage.getItem(SAVE_KEY);
        setHasSaveFile(!!savedGame);
    }, []);

    // Manage online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Execute pending action when connection is restored
    useEffect(() => {
        if (isOnline && pendingAction) {
            console.log('Connection restored. Executing pending action.');
            pendingAction();
            setPendingAction(null);
        }
    }, [isOnline, pendingAction]);
    
    const applyStatChanges = (changes: Partial<PlayerStats>) => {
        setPlayerStats(prevStats => {
            const newStats = { ...prevStats };
            for (const key in changes) {
                const statKey = key as keyof PlayerStats;
                const changeValue = changes[statKey] || 0;

                if (statKey === 'Beli') {
                    newStats.Beli = (newStats.Beli || 0) + changeValue;
                } else if (statKey === 'Bounty') {
                    // Bounty is a replacement, not an addition
                    newStats.Bounty = changeValue > 0 ? changeValue : newStats.Bounty;
                } else {
                    const currentValue = newStats[statKey] || 0;
                    (newStats[statKey] as number) = Math.max(1, Math.min(20, currentValue + changeValue));
                }
            }
            return newStats;
        });
    };
    
    const saveGameState = useCallback(() => {
        if (!playerLoadout || view === 'customization') return;

        const gameState = {
            playerStats,
            playerLoadout,
            playerInventory,
            crew,
            reputationAnalysis,
            scene,
            majorEncounter,
            storyKey,
            view,
            lastAttemptedChoice,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        setHasSaveFile(true);
        showSystemMessage("Log Pose Saved!", 2500);
    }, [playerStats, playerLoadout, playerInventory, crew, reputationAnalysis, scene, majorEncounter, storyKey, view, lastAttemptedChoice, showSystemMessage]);


    const loadGameState = useCallback(() => {
        const savedGameJSON = localStorage.getItem(SAVE_KEY);
        if (savedGameJSON) {
            try {
                const savedGame = JSON.parse(savedGameJSON);

                // A valid save must have at least the loadout and stats.
                if (!savedGame.playerLoadout || !savedGame.playerStats) {
                    throw new Error("Save file is corrupted or incomplete.");
                }
                
                setPlayerStats(savedGame.playerStats);
                setPlayerLoadout(savedGame.playerLoadout);
                
                // Backwards compatibility for save files: ensure inventory structure is complete
                const defaultInventory = { outfits: [], weapons: [], titles: [], abilities: [] };
                const loadedInventory = { ...defaultInventory, ...(savedGame.playerInventory || {}) };

                setPlayerInventory(loadedInventory);
                setCrew(savedGame.crew || []);
                setReputationAnalysis(savedGame.reputationAnalysis || '');
                setScene(savedGame.scene || null);
                setMajorEncounter(savedGame.majorEncounter || null);
                setStoryKey(savedGame.storyKey || 0);
                setView(savedGame.view || 'game');
                setLastAttemptedChoice(savedGame.lastAttemptedChoice || null);

                setIsLoading(false);
                setError(null);
                showSystemMessage("Log Pose Loaded!", 2500);
            } catch (e) {
                console.error("Failed to load game state:", e);
                showSystemMessage("Log Pose corrupted. Starting new adventure.", 3000);
                localStorage.removeItem(SAVE_KEY);
                setHasSaveFile(false);
                // Reset to a clean state
                setView('customization');
                setScene(null);
                setPlayerLoadout(null);
            }
        }
    }, [showSystemMessage]);

    const handleLoadGameClick = useCallback(() => {
        if (!hasSaveFile) return;
        if (window.confirm("Are you sure you want to load your last log? Any unsaved progress will be lost.")) {
            loadGameState();
        }
    }, [hasSaveFile, loadGameState]);

    const handleGameStart = async (params: { name: string; outfit: Item; weapon: Item; path: 'Pirate' | 'Marine' | 'Revolutionary' | 'Celestial Dragon' | 'Swordsman' | 'Cipher Pol'; gender: 'Male' | 'Female' | 'Non-binary'; origin: OriginSea; devilFruit: DevilFruit | null; }) => {
        const { name, outfit, weapon, path, gender, origin, devilFruit } = params;
        
        let initialTitle = 'Rookie Pirate';
        let initialFaction = 'Unaffiliated';
        let initialStats = pirateInitialStats;

        if (path === 'Marine') {
            initialTitle = 'Marine Recruit';
            initialFaction = 'Marines';
            initialStats = marineInitialStats;
        } else if (path === 'Revolutionary') {
            initialTitle = 'Freedom Fighter';
            initialFaction = 'Revolutionary Army';
            initialStats = revolutionaryInitialStats;
        } else if (path === 'Celestial Dragon') {
            initialTitle = 'World Noble';
            initialFaction = 'World Government';
            initialStats = celestialDragonInitialStats;
        } else if (path === 'Swordsman') {
            initialTitle = 'Wandering Swordsman';
            initialFaction = 'Unaffiliated';
            initialStats = swordsmanInitialStats;
        } else if (path === 'Cipher Pol') {
            initialTitle = 'Cipher Pol Agent';
            initialFaction = 'World Government';
            initialStats = cipherPolInitialStats;
        }

        const fullLoadout: PlayerLoadout = { name, outfit, weapon, title: initialTitle, equippedAbilities: [], gender, faction: initialFaction, devilFruit };
        setPlayerLoadout(fullLoadout);
        setPlayerInventory({ 
            outfits: [outfit], 
            weapons: [weapon],
            titles: [initialTitle],
            abilities: []
        });
        setView('game');
        setIsLoading(true);
        setError(null);
        setPlayerStats(initialStats);
        setMajorEncounter(null);
        setCrew([]);
        
        try {
            const initialPayload = await startStory(params);
            
            // Safeguard against giving bounty to WG-aligned players at start
            const isWGAligned = initialFaction === 'Marines' || initialFaction === 'World Government';
            if (initialPayload.statChanges.Bounty && isWGAligned) {
                delete initialPayload.statChanges.Bounty;
            }

            setScene({ story: initialPayload.story, choices: initialPayload.choices.map(c => ({...c})) });
            setReputationAnalysis(initialPayload.reputationAnalysis);
            setMajorEncounter(initialPayload.majorEncounter || null);
            if (initialPayload.statChanges) {
                applyStatChanges(initialPayload.statChanges);
            }
            if (initialPayload.newTitle) {
                setPlayerInventory(prev => ({...prev, titles: [...prev.titles, initialPayload.newTitle!]}));
            }
            setStoryKey(prev => prev + 1);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChoice = async (choice: Choice) => {
        if (!scene || isLoading || pendingAction || !playerStats || !playerLoadout) return;

        setLastAttemptedChoice(choice);

        const action = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const payload = await advanceStory(choice.text, playerStats, playerLoadout, playerInventory, crew, majorEncounter);
                setLastAttemptedChoice(null); // Clear on success

                const isEncounterOver = !!(payload.isMajorEncounterOver && majorEncounter);

                // Process all state updates based on the payload and current state.
                const rewardMessages: string[] = [];
                let nextInventory = { ...playerInventory };
                let nextLoadout = { ...playerLoadout };
                let nextCrew = [...crew];

                if (isEncounterOver) {
                    const victoryMessage = `VICTORY! You defeated ${majorEncounter.name}!`;
                    rewardMessages.push(victoryMessage);
                }

                // Process new faction first as it can affect other logic
                if (payload.newFaction && nextLoadout.faction !== payload.newFaction) {
                    nextLoadout.faction = payload.newFaction;
                    rewardMessages.push(`Faction Change: ${payload.newFaction}`);
                }

                // Client-side safeguard for bounty logic
                const isWGAligned = nextLoadout.faction === 'Marines' || nextLoadout.faction === 'World Government';
                if (payload.statChanges.Bounty && isWGAligned) {
                    delete payload.statChanges.Bounty; // Remove bounty update if aligned with WG
                }
                
                // Process new title
                if (payload.newTitle && !nextInventory.titles.includes(payload.newTitle)) {
                    nextInventory.titles = [...nextInventory.titles, payload.newTitle];
                    nextLoadout.title = payload.newTitle; // Auto-equip new title
                    rewardMessages.push(`New Title: ${payload.newTitle}`);
                }

                // Process new item
                if (payload.newItem) {
                    const { type, ...item } = payload.newItem;
                    const listKey = type === 'weapon' ? 'weapons' : 'outfits';
                    if (!nextInventory[listKey].some(i => i.name === item.name)) {
                        nextInventory[listKey] = [...nextInventory[listKey], item];
                        nextLoadout[type] = item; // Auto-equip new item
                        rewardMessages.push(`New Item: ${item.name}`);
                    }
                }

                // Process new ability
                if (payload.newAbility && !nextInventory.abilities.some(a => a.name === payload.newAbility.name)) {
                    nextInventory.abilities = [...nextInventory.abilities, payload.newAbility];
                    rewardMessages.push(`New Ability: ${payload.newAbility.name}`);
                }

                // Process item and ability updates
                if (payload.itemUpdates) {
                    payload.itemUpdates.forEach(update => {
                        let itemEvolved = false;
                        const weaponIndex = nextInventory.weapons.findIndex(i => i.name === update.name);
                        if (weaponIndex > -1) {
                            nextInventory.weapons[weaponIndex] = { ...nextInventory.weapons[weaponIndex], ...update };
                            if (nextLoadout.weapon.name === update.name) {
                                nextLoadout.weapon = { ...nextLoadout.weapon, ...update };
                            }
                            itemEvolved = true;
                        }
                        
                        const outfitIndex = nextInventory.outfits.findIndex(i => i.name === update.name);
                        if (outfitIndex > -1) {
                            nextInventory.outfits[outfitIndex] = { ...nextInventory.outfits[outfitIndex], ...update };
                             if (nextLoadout.outfit.name === update.name) {
                                nextLoadout.outfit = { ...nextLoadout.outfit, ...update };
                            }
                            itemEvolved = true;
                        }

                        if (itemEvolved) {
                           rewardMessages.push(`Evolved: ${update.name}!`);
                        }
                    });
                }
                
                if (payload.abilityUpdates) {
                    payload.abilityUpdates.forEach(update => {
                        const abilityIndex = nextInventory.abilities.findIndex(a => a.name === update.name);
                        if (abilityIndex > -1) {
                             nextInventory.abilities[abilityIndex] = { ...nextInventory.abilities[abilityIndex], ...update };

                            const equippedIndex = nextLoadout.equippedAbilities.findIndex(a => a.name === update.name);
                            if (equippedIndex > -1) {
                                nextLoadout.equippedAbilities[equippedIndex] = { ...nextLoadout.equippedAbilities[equippedIndex], ...update };
                            }
                            rewardMessages.push(`Evolved: ${update.name}!`);
                        }
                    });
                }
                
                // Process crew changes
                if (payload.newCrewMembers) {
                    nextCrew = [...nextCrew, ...payload.newCrewMembers];
                }
                if (payload.crewUpdates) {
                    nextCrew = nextCrew.map(member => {
                        const update = payload.crewUpdates!.find(u => u.name === member.name);
                        return update ? { ...member, ...update } : member;
                    });
                }
                
                // Set all states. React will batch these updates.
                setScene({ story: payload.story, choices: payload.choices.map(c => ({...c})) });
                setReputationAnalysis(payload.reputationAnalysis);
                applyStatChanges(payload.statChanges);
                
                if (isEncounterOver) {
                    setMajorEncounter(null);
                } else {
                    // Persist or update the encounter state
                    setMajorEncounter(payload.majorEncounter || majorEncounter);
                }

                setPlayerInventory(nextInventory);
                setPlayerLoadout(nextLoadout);
                setCrew(nextCrew);
                
                if (rewardMessages.length > 0) {
                    showSystemMessage({ title: isEncounterOver ? 'EPIC VICTORY!' : 'Treasure Acquired!', items: rewardMessages }, isEncounterOver ? 7000 : 5000);
                }

                setStoryKey(prev => prev + 1);

            } catch (e) {
                if (e instanceof QuotaError) {
                    console.warn("Quota error caught, disabling choice:", choice.text);
                    setScene(prevScene => {
                        if (!prevScene) return null;
                        const newChoices = prevScene.choices.map((c): DisplayChoice =>
                            c.id === choice.id ? { ...c, status: 'unavailable' } : c
                        );
                        return { ...prevScene, choices: newChoices };
                    });
                } else {
                    console.error(e);
                    setError(e instanceof Error ? e.message : "An unknown error occurred while advancing the story.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        if (isOnline) {
            action();
        } else {
            console.log("Offline. Action queued.");
            setPendingAction(() => action);
        }
    };

    const handleReloadChoices = async () => {
        if (!scene || isLoading || pendingAction || !playerStats || !playerLoadout) return;

        const action = async () => {
            setIsLoading(true);
            setError(null);
            showSystemMessage("The winds of fate shift...", 2000);
            try {
                const payload = await regenerateChoices(scene.story, playerStats, playerLoadout, playerInventory, crew);
                
                setScene(prevScene => {
                    if (!prevScene) return null;
                    return {
                        story: prevScene.story, // Keep old story
                        choices: payload.choices.map(c => ({ ...c })), // Use new choices
                    };
                });
                
                if (payload.reputationAnalysis) {
                    setReputationAnalysis(payload.reputationAnalysis);
                }
                setChoicesKey(k => k + 1); // Force re-render of choice buttons

            } catch (e) {
                console.error(e);
                setError(e instanceof Error ? e.message : "The Transponder Snail failed to find a new path.");
            } finally {
                setIsLoading(false);
            }
        };
        
        if (isOnline) {
            action();
        } else {
            showSystemMessage("Cannot reroll choices while offline.", 3000);
        }
    };
    
    const handleRetry = () => {
        setError(null);
        if (lastAttemptedChoice) {
            handleChoice(lastAttemptedChoice);
        }
    };

    const handleEquipItem = (item: Item, type: 'outfit' | 'weapon') => {
        setPlayerLoadout(prev => (prev ? { ...prev, [type]: item } : null));
    };

    const handleEquipTitle = (title: string) => {
        setPlayerLoadout(prev => (prev ? { ...prev, title } : null));
    };

    const handleEquipAbility = (ability: Ability) => {
        setPlayerLoadout(prevLoadout => {
            if (!prevLoadout) return null;

            const isEquipped = prevLoadout.equippedAbilities.some(a => a.name === ability.name);

            if (isEquipped) {
                // Unequip
                const updatedAbilities = prevLoadout.equippedAbilities.filter(a => a.name !== ability.name);
                return { ...prevLoadout, equippedAbilities: updatedAbilities };
            } else {
                // Equip
                const updatedAbilities = [...prevLoadout.equippedAbilities, ability];
                return { ...prevLoadout, equippedAbilities: updatedAbilities };
            }
        });
    };

    const handleStatChange = (stat: keyof PlayerStats, change: number) => {
        setPlayerStats(prevStats => {
            const newStats = { ...prevStats };
            const currentValue = newStats[stat] || 0;
            let newValue = currentValue + change;

            if (stat === 'Beli' || stat === 'Bounty') {
                newValue = Math.max(0, newValue); // Currencies can't be negative
            } else {
                newValue = Math.max(1, Math.min(20, newValue)); // Attributes are 1-20
            }

            (newStats[stat] as number) = newValue;
            return newStats;
        });
    };

    const restartGame = useCallback(() => {
        if (!window.confirm("Are you sure you want to start a new adventure? This will permanently delete all saved data and restart the application.")) {
            return;
        }
    
        const clearDataAndReload = async () => {
            console.log('Starting full application reset...');
            try {
                // Tell Service Worker to clear the API cache
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE' });
                    console.log('Sent command to clear API cache.');
                }
    
                // Clear localStorage
                localStorage.removeItem(SAVE_KEY);
                console.log('Cleared localStorage save file.');
    
                // Force a reload to reset all application state from scratch
                window.location.reload();
            } catch (error) {
                console.error("Error during game restart process:", error);
                // Fallback for safety, still try to clear and reload.
                localStorage.removeItem(SAVE_KEY);
                window.location.reload();
            }
        };
    
        clearDataAndReload();
    }, []);

    const renderContent = () => {
        if (view === 'customization') {
            return <CustomizationPage options={staticCustomizationOptions} onStartGame={handleGameStart} hasSaveFile={hasSaveFile} onLoadGame={loadGameState}/>;
        }
        if (view === 'stats' && playerStats && playerLoadout) {
            return <StatsPage 
                        stats={playerStats} 
                        loadout={playerLoadout} 
                        inventory={playerInventory}
                        crew={crew}
                        analysis={reputationAnalysis} 
                        onReturn={() => setView('game')} 
                        onEquipItem={handleEquipItem}
                        onEquipTitle={handleEquipTitle}
                        onEquipAbility={handleEquipAbility}
                        onStatChange={handleStatChange}
                   />;
        }
        return (
            <>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 flex-grow min-h-[250px] flex flex-col justify-center">
                    {error && <ErrorDisplay message={error} onRetry={handleRetry} />}
                    {!error && (isLoading || pendingAction) && !scene && <Loader text="Setting sail for a new adventure..." />}
                    {!error && scene && (
                        <StoryDisplay key={storyKey} text={scene.story} />
                    )}
                </div>

                {!error && (
                    <div className="w-full">
                        {(isLoading || pendingAction) && scene && (
                            <div className="flex justify-center items-center h-48">
                                <Loader text={!isOnline ? "Transponder Snail signal lost. Reconnecting..." : "The tides are changing..."} />
                            </div>
                        )}
                        {!(isLoading || pendingAction) && scene && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={handleReloadChoices}
                                        className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors text-sm shadow-md flex items-center gap-2 disabled:bg-cyan-400 disabled:cursor-not-allowed"
                                        disabled={isLoading || pendingAction !== null}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10.899 12.101a1 1 0 01-1.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101z" clipRule="evenodd" />
                                        </svg>
                                        Reroll Choices
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    {scene.choices.map((choice) => (
                                        <ChoiceButton key={`${choice.id}-${choicesKey}`} choice={choice} onChoose={handleChoice} disabled={isLoading || pendingAction !== null} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="min-h-screen text-gray-800 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gray-50">
            {/* System Message Toast */}
            {systemMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-full max-w-md px-4">
                    {typeof systemMessage === 'string' ? (
                        <div className="text-base text-center font-bold text-green-800 bg-green-100/95 backdrop-blur-sm border border-green-300 px-6 py-3 rounded-lg shadow-xl">
                            {systemMessage}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-yellow-300 to-orange-400 text-yellow-900 border-2 border-yellow-500 rounded-xl shadow-2xl p-4 text-center">
                            <h3 className="text-2xl font-black tracking-wider uppercase mb-3 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
                                    <path d="M3 9a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                                {systemMessage.title}
                            </h3>
                            <div className="bg-yellow-50/70 backdrop-blur-sm rounded-lg p-3 space-y-1 max-h-48 overflow-y-auto">
                                {systemMessage.items.map((reward, index) => (
                                    <p key={index} className="font-semibold text-sm text-yellow-900/90">{reward}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


            <main className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
                <header className="text-center mb-6">
                     <h1 className="text-6xl md:text-7xl font-extrabold pb-2 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                        {titleText}
                    </h1>
                     <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-4 h-auto min-h-[32px]">
                        {majorEncounter ? (
                            <p className="text-2xl font-bold text-red-600 animate-pulse">
                                !! MAJOR THREAT: {majorEncounter.name} !!
                            </p>
                        ) : (
                             playerLoadout && <p className="text-gray-600 text-lg font-semibold">{playerLoadout.name} | {playerLoadout.title} ({playerLoadout.faction})</p>
                        )}
                        {!isOnline && (
                           <p className="text-sm font-bold text-yellow-600 animate-pulse bg-yellow-100 px-2 py-1 rounded border border-yellow-400">Offline Mode</p>
                        )}
                        {view !== 'customization' && (
                            <>
                                <button 
                                    onClick={() => setView(view === 'game' ? 'stats' : 'game')}
                                    className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm shadow-md"
                                >
                                    {view === 'game' ? 'View Bounty Poster' : 'Return to Ship'}
                                </button>
                                <button
                                    onClick={() => saveGameState()}
                                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm shadow-md"
                                >
                                    Save Log Pose
                                </button>
                                <button
                                    onClick={() => handleLoadGameClick()}
                                    disabled={!hasSaveFile}
                                    className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Load Log Pose
                                </button>
                                <button
                                    onClick={() => restartGame()}
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm shadow-md"
                                >
                                    New Game
                                </button>
                            </>
                        )}
                    </div>
                </header>
                
                {renderContent()}

                 <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Google Gemini. Every pirate's dream is unique.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;
