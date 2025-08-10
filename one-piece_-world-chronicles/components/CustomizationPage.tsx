



import React, { useState } from 'react';
import { CustomizationOptions, Item, OriginSea, DevilFruit } from '../types';

interface CustomizationPageProps {
  options: CustomizationOptions;
  onStartGame: (params: { name: string; outfit: Item; weapon: Item; path: 'Pirate' | 'Marine' | 'Revolutionary' | 'Celestial Dragon' | 'Swordsman' | 'Cipher Pol'; gender: 'Male' | 'Female' | 'Non-binary', origin: OriginSea, devilFruit: DevilFruit | null }) => void;
  hasSaveFile: boolean;
  onLoadGame: () => void;
}

const SelectionCard: React.FC<{ item: Item; isSelected: boolean; onSelect: () => void }> = ({ item, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`p-4 border-2 rounded-lg transition-all duration-200 h-full flex flex-col justify-center text-left ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-300 bg-white hover:border-orange-400'}`}
    >
        <h4 className="font-bold text-lg text-orange-600">{item.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
    </button>
);

const PathCard: React.FC<{ name: string; description: string; isSelected: boolean; onSelect: () => void; color: string }> = ({ name, description, isSelected, onSelect, color }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`p-4 border-2 rounded-lg transition-all duration-200 text-center h-full flex flex-col justify-center ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-300 bg-white hover:border-orange-400'}`}
    >
        <h4 className={`font-bold text-xl ${color}`}>{name}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
);

const GenderCard: React.FC<{ name: 'Male' | 'Female' | 'Non-binary'; isSelected: boolean; onSelect: () => void }> = ({ name, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`p-4 border-2 rounded-lg transition-all duration-200 text-center ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-300 bg-white hover:border-orange-400'}`}
    >
        <h4 className={`font-bold text-xl text-gray-700`}>{name}</h4>
    </button>
);

const OriginSeaCard: React.FC<{ name: OriginSea; isSelected: boolean; onSelect: () => void }> = ({ name, isSelected, onSelect }) => (
     <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`p-4 border-2 rounded-lg transition-all duration-200 text-center ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-300 bg-white hover:border-orange-400'}`}
    >
        <h4 className={`font-bold text-xl text-gray-700`}>{name}</h4>
    </button>
)

const devilFruitList: (DevilFruit | null)[] = [
    { name: "None", description: "You are a strong swimmer who relies on pure skill and training, not a mysterious fruit." },
    { name: "Gravity-Gravity Fruit", description: "Grants the user the ability to manipulate gravitational forces, making objects float or applying immense pressure. Eating it means you will never swim again." },
    { name: "Light-Light Fruit", description: "Allows the user to create, control, and transform into light. This grants light-speed movement and devastating laser attacks, while making their body intangible to any physical attack not imbued with Haki. Eating it means you will never swim again." },
    { name: "Lightning-Lightning Fruit", description: "Allows the user to create, control, and transform into pure lightning. This grants immense destructive power and makes their body intangible to any physical attack not imbued with Haki. Eating it means you will never swim again." },
    { name: "Quake-Quake Fruit", description: "A Paramecia-type fruit with the power to generate massive vibrations, or 'quakes,' through any medium. At full power, it's capable of shattering entire islands. Eating it means you will never swim again." },
    { name: "Cold-Cold Fruit", description: "A Logia-type fruit that allows the user to create, control, and transform into ice. They can freeze entire landscapes and are completely intangible to any physical attack not imbued with Haki. Eating it means you will never swim again." },
    { name: "Flame-Flame Fruit", description: "A Logia-type fruit that allows the user to create, control, and transform into fire. They can launch devastating pyrokinetic attacks and are completely intangible to any physical attack not imbued with Haki. Eating it means you will never swim again." },
    { name: "Ope-Ope Fruit", description: "Grants the user the ability to create a spherical 'Room' where they can spatially rearrange tangible objects. It's a power of high-precision control, often used for surgical maneuvers. It CANNOT affect a person's consciousness or soul and drains significant stamina. Eating it means you will never swim again." },
    { name: "Luck-Luck Fruit", description: "A subtle Paramecia that grants the user a hyper-developed sense of intuition, allowing them to subconsciously anticipate danger and notice fortunate opportunities. This results in 'lucky' outcomes, like narrowly dodging an attack or finding a hidden item. Eating it means you will never swim again."},
    { name: "Dragon-Dragon Fruit, Model: Azure Dragon", description: "A mythical Zoan-type fruit granting the power to become an Eastern Dragon, with flight, scales, and elemental breath. Eating it means you will never swim again." }
];


export const CustomizationPage: React.FC<CustomizationPageProps> = ({ options, onStartGame, hasSaveFile, onLoadGame }) => {
    const [playerName, setPlayerName] = useState<string>('');
    const [selectedOutfit, setSelectedOutfit] = useState<Item | null>(null);
    const [selectedWeapon, setSelectedWeapon] = useState<Item | null>(null);
    const [selectedPath, setSelectedPath] = useState<'Pirate' | 'Marine' | 'Revolutionary' | 'Celestial Dragon' | 'Swordsman' | 'Cipher Pol' | null>(null);
    const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Non-binary' | null>(null);
    const [selectedOrigin, setSelectedOrigin] = useState<OriginSea | null>(null);
    const [selectedDevilFruit, setSelectedDevilFruit] = useState<DevilFruit | null | undefined>(undefined);


    const handleStart = () => {
        if (playerName.trim() && selectedOutfit && selectedWeapon && selectedPath && selectedGender && selectedOrigin && selectedDevilFruit !== undefined) {
            onStartGame({ 
                name: playerName.trim(),
                outfit: selectedOutfit, 
                weapon: selectedWeapon, 
                path: selectedPath,
                gender: selectedGender,
                origin: selectedOrigin,
                devilFruit: selectedDevilFruit,
            });
        }
    }

    const originSeas: OriginSea[] = ['East Blue', 'West Blue', 'North Blue', 'South Blue'];

    return (
        <div className="w-full animate-fade-in bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Set Sail on Your Adventure!</h2>
            {hasSaveFile ? (
                 <p className="text-center text-gray-600 mb-8">Continue your voyage or forge a new destiny below.</p>
            ) : (
                <p className="text-center text-gray-600 mb-8">The sea is calling. Choose your path, your crew, and your dream.</p>
            )}

            {hasSaveFile && (
                <div className="text-center mb-10 border-b-2 border-gray-100 pb-10">
                     <button
                        onClick={onLoadGame}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-green-700 transform hover:scale-105 shadow-lg"
                    >
                        Load Previous Log
                    </button>
                </div>
            )}

            <div className={`space-y-10 ${hasSaveFile ? 'mt-8' : ''}`}>
                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">1. What is Your Name?</h3>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your character's name"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg bg-white"
                        maxLength={25}
                    />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">2. Choose Your Path</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <PathCard name="Pirate" description="Seek freedom, adventure, and the world's greatest treasures. Live by your own rules." isSelected={selectedPath === 'Pirate'} onSelect={() => setSelectedPath('Pirate')} color="text-red-700" />
                       <PathCard name="Marine" description="Uphold justice, protect the innocent, and maintain order across the seas." isSelected={selectedPath === 'Marine'} onSelect={() => setSelectedPath('Marine')} color="text-blue-600" />
                       <PathCard name="Revolutionary" description="Fight the tyranny of the World Government and bring true freedom to the people." isSelected={selectedPath === 'Revolutionary'} onSelect={() => setSelectedPath('Revolutionary')} color="text-green-700" />
                       <PathCard name="Swordsman" description="Walk the path of the blade, seeking to become the World's Strongest. Your sword is your only law." isSelected={selectedPath === 'Swordsman'} onSelect={() => setSelectedPath('Swordsman')} color="text-cyan-600" />
                       <PathCard name="Celestial Dragon" description="Born into absolute power as a World Noble. The world is your plaything." isSelected={selectedPath === 'Celestial Dragon'} onSelect={() => setSelectedPath('Celestial Dragon')} color="text-purple-600" />
                       <PathCard name="Cipher Pol" description="Serve the World Government from the shadows as a secret agent. Your duty is to protect the world's secrets." isSelected={selectedPath === 'Cipher Pol'} onSelect={() => setSelectedPath('Cipher Pol')} color="text-gray-700" />
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">3. Choose Your Origin Sea</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {originSeas.map(sea => (
                           <OriginSeaCard key={sea} name={sea} isSelected={selectedOrigin === sea} onSelect={() => setSelectedOrigin(sea)} />
                       ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">4. Choose a Devil Fruit</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devilFruitList.map(df => (
                            <SelectionCard 
                                key={df ? df.name : 'none'}
                                item={df || { name: "Error", description: ""}}
                                isSelected={selectedDevilFruit?.name === df?.name}
                                onSelect={() => setSelectedDevilFruit(df)}
                            />
                        ))}
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">5. Choose Your Profile</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <GenderCard name="Male" isSelected={selectedGender === 'Male'} onSelect={() => setSelectedGender('Male')} />
                       <GenderCard name="Female" isSelected={selectedGender === 'Female'} onSelect={() => setSelectedGender('Female')} />
                       <GenderCard name="Non-binary" isSelected={selectedGender === 'Non-binary'} onSelect={() => setSelectedGender('Non-binary')} />
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">6. Choose Your Outfit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.outfits.map(item => (
                            <SelectionCard 
                                key={item.name}
                                item={item}
                                isSelected={selectedOutfit?.name === item.name}
                                onSelect={() => setSelectedOutfit(item)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">7. Choose Your Primary Weapon</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.weapons.map(item => (
                            <SelectionCard 
                                key={item.name}
                                item={item}
                                isSelected={selectedWeapon?.name === item.name}
                                onSelect={() => setSelectedWeapon(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <button
                    onClick={handleStart}
                    disabled={!playerName.trim() || !selectedOutfit || !selectedWeapon || !selectedPath || !selectedGender || !selectedOrigin || selectedDevilFruit === undefined}
                    className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none shadow-lg disabled:shadow-none"
                >
                    Begin Adventure
                </button>
            </div>
        </div>
    );
};