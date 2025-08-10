
import React from 'react';
import { PlayerStats, PlayerLoadout, PlayerInventory, Item, CrewMember, Ability } from '../types';

interface StatsPageProps {
  stats: PlayerStats;
  loadout: PlayerLoadout;
  inventory: PlayerInventory;
  crew: CrewMember[];
  analysis: string;
  onReturn: () => void;
  onEquipItem: (item: Item, type: 'outfit' | 'weapon') => void;
  onEquipTitle: (title: string) => void;
  onEquipAbility: (ability: Ability) => void;
  onStatChange: (stat: keyof PlayerStats, change: number) => void;
}

const EditableStatBar: React.FC<{
    label: string;
    statKey: keyof PlayerStats;
    value: number;
    color?: string;
    onStatChange: (stat: keyof PlayerStats, change: number) => void;
}> = ({ label, statKey, value, color = 'bg-blue-500', onStatChange }) => {
    const percentage = (value / 20) * 100;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-base font-semibold text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onStatChange(statKey, -1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors">-</button>
                    <span className="text-sm font-bold text-gray-500 w-12 text-center">{value} / 20</span>
                    <button onClick={() => onStatChange(statKey, 1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors">+</button>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const CurrencyEditor: React.FC<{
    label: string;
    statKey: keyof PlayerStats;
    value: number;
    color: string;
    onStatChange: (stat: keyof PlayerStats, change: number) => void;
}> = ({ label, statKey, value, color, onStatChange }) => {
    const incrementAmount = label === 'Bounty' ? 10000000 : 100000;
    const decrementAmount = label === 'Bounty' ? -10000000 : 100000;

    return (
        <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
            <span>{label}:</span>
            <div className="flex items-center gap-2">
                <button onClick={() => onStatChange(statKey, decrementAmount)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors">-</button>
                <span className={`font-mono ${color} w-36 text-center`}>฿ {value.toLocaleString()}</span>
                <button onClick={() => onStatChange(statKey, incrementAmount)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors">+</button>
            </div>
        </div>
    );
};

const getRelationshipColorClass = (relationship: CrewMember['relationship']): string => {
    switch (relationship) {
        case 'Nakama': return 'bg-green-100 text-green-800';
        case 'Captain': return 'bg-yellow-100 text-yellow-800';
        case 'First Mate': return 'bg-blue-100 text-blue-800';
        case 'Ally': return 'bg-cyan-100 text-cyan-800';
        case 'Rival': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getAbilityTypeColorClass = (type: Ability['type']): string => {
    switch (type) {
        case 'Devil Fruit': return 'bg-purple-100 text-purple-800';
        case 'Haki': return 'bg-red-100 text-red-800';
        case 'Fighting Style': return 'bg-yellow-100 text-yellow-800';
        case 'Swordsmanship': return 'bg-blue-100 text-blue-800';
        case 'Awakening': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}


const InventoryList: React.FC<{
    title: string;
    items: Item[];
    equippedItem: Item;
    type: 'outfit' | 'weapon';
    onEquip: (item: Item, type: 'outfit' | 'weapon') => void;
}> = ({ title, items, equippedItem, type, onEquip }) => (
    <div>
        <h3 className="text-xl font-bold text-orange-600 mb-4">{title}</h3>
        <div className="max-h-72 overflow-y-auto space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {items.length > 0 ? items.map(item => {
                const isEquipped = item.name === equippedItem.name;
                return (
                    <div key={item.name} className={`bg-white p-3 rounded-md border ${isEquipped ? 'border-orange-500 shadow-md' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                {item.grade && item.grade !== 'Ungraded' && <p className="text-xs font-semibold text-purple-600 mt-1">Grade: {item.grade}</p>}
                            </div>
                            <button
                                onClick={() => onEquip(item, type)}
                                disabled={isEquipped}
                                className="ml-4 text-sm font-semibold py-1 px-3 rounded-md transition-colors whitespace-nowrap
                                           bg-gray-200 text-gray-800 hover:bg-gray-300
                                           disabled:bg-orange-600 disabled:text-white disabled:cursor-not-allowed"
                            >
                                {isEquipped ? 'Equipped' : 'Equip'}
                            </button>
                        </div>
                    </div>
                );
            }) : (
                 <div className="bg-white p-4 rounded-md">
                    <p className="text-gray-600 italic text-center">No {title.toLowerCase()} acquired yet.</p>
                </div>
            )}
        </div>
    </div>
);


export const StatsPage: React.FC<StatsPageProps> = ({ stats, loadout, inventory, crew, analysis, onReturn, onEquipItem, onEquipTitle, onEquipAbility, onStatChange }) => {
  const { equippedAbilities } = loadout;
  const unlockedAbilities = inventory.abilities;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 animate-fade-in w-full">
      <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-2">
        <h2 className="text-3xl font-bold text-gray-800">
            {loadout.name}'s Bounty Poster
        </h2>
        <button
            onClick={onReturn}
            className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm"
        >
            Return
        </button>
      </div>
       <p className="text-sm text-gray-500 mb-6 italic">You can now edit your stats directly. The path to power is yours to choose.</p>
      
      <div className="space-y-8">
        
        {/* Profile and Bounty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Profile</h3>
                <div className="bg-gray-100 p-4 rounded-md border border-gray-200 space-y-3">
                    <p className="text-lg font-semibold text-gray-800">
                        Faction: <span className="font-normal text-gray-700">{loadout.faction}</span>
                    </p>
                     <div>
                        <p className="font-semibold text-gray-800">Devil Fruit:</p>
                        {loadout.devilFruit && loadout.devilFruit.name !== 'None' ? (
                             <p className="text-sm text-gray-600"><span className="font-bold text-gray-700">{loadout.devilFruit.name}:</span> {loadout.devilFruit.description}</p>
                        ) : (
                             <p className="text-sm text-gray-600 italic">None</p>
                        )}
                    </div>
                </div>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-orange-600 mb-3">Bounty & Wealth</h3>
                <div className="bg-gray-100 p-4 rounded-md border border-gray-200 h-full flex flex-col justify-center space-y-4">
                    <CurrencyEditor label="Bounty" statKey="Bounty" value={stats.Bounty} color="text-red-600" onStatChange={onStatChange} />
                    <CurrencyEditor label="Beli" statKey="Beli" value={stats.Beli} color="text-green-600" onStatChange={onStatChange} />
                </div>
            </div>
        </div>

        {/* Titles Section */}
        <div>
            <h3 className="text-xl font-bold text-orange-600 mb-2">Acquired Titles</h3>
            <p className="text-sm text-gray-600 mb-3">
                Current Title: <span className="font-bold text-orange-700">{loadout.title}</span>
            </p>
            <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {inventory.titles.length > 0 ? inventory.titles.map(title => {
                        const isEquipped = title === loadout.title;
                        return (
                             <button
                                key={title}
                                onClick={() => onEquipTitle(title)}
                                disabled={isEquipped}
                                className={`
                                    py-1 px-3 rounded-full text-sm font-semibold transition-colors
                                    ${isEquipped
                                        ? 'bg-orange-600 text-white cursor-default'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                                    }
                                `}
                            >
                                {title}
                            </button>
                        );
                    }) : <p className="text-gray-500 italic p-2">No titles acquired yet.</p>}
                </div>
            </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="text-xl font-bold text-orange-600 mb-4">Core Attributes</h3>
              <div className="space-y-4">
                <EditableStatBar label="Agility" statKey="Agility" value={stats.Agility} onStatChange={onStatChange}/>
                <EditableStatBar label="Strength" statKey="Strength" value={stats.Strength} color="bg-yellow-500" onStatChange={onStatChange}/>
                <EditableStatBar label="Endurance" statKey="Endurance" value={stats.Endurance} color="bg-green-500" onStatChange={onStatChange}/>
                <EditableStatBar label="Intelligence" statKey="Intelligence" value={stats.Intelligence} onStatChange={onStatChange}/>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-600 mb-4">Potential & Willpower</h3>
              <div className="space-y-4">
                 <EditableStatBar label="Willpower" statKey="Willpower" value={stats.Willpower} color="bg-purple-500" onStatChange={onStatChange}/>
                 <EditableStatBar label="Haki Control" statKey="HakiControl" value={stats.HakiControl} color="bg-cyan-500" onStatChange={onStatChange}/>
                 <EditableStatBar label="Devil Fruit Mastery" statKey="DevilFruitMastery" value={stats.DevilFruitMastery} color="bg-pink-500" onStatChange={onStatChange}/>
              </div>
            </div>
        </div>

        {/* Combat Proficiency Section */}
        <div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">Combat Proficiency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <EditableStatBar label="Conqueror's Haki" statKey="ConquerorsHaki" value={stats.ConquerorsHaki} color="bg-orange-500" onStatChange={onStatChange}/>
                <EditableStatBar label="Armament Haki" statKey="ArmamentHaki" value={stats.ArmamentHaki} color="bg-red-500" onStatChange={onStatChange}/>
                <EditableStatBar label="Observation Haki" statKey="ObservationHaki" value={stats.ObservationHaki} color="bg-blue-500" onStatChange={onStatChange}/>
            </div>
        </div>
        
        {/* Abilities Section */}
        <div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">Known Abilities ({equippedAbilities.length} Equipped)</h3>
            <div className="max-h-72 overflow-y-auto space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {unlockedAbilities.length > 0 ? (
                unlockedAbilities.map(tech => {
                     if (!tech) return null; // Defensive check
                     const isEquipped = equippedAbilities.some(t => t.name === tech.name);
                     return (
                        <div key={tech.name} className={`bg-white p-3 rounded-md border ${isEquipped ? 'border-orange-500 shadow-md' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-gray-800">{tech.name}</p>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getAbilityTypeColorClass(tech.type)}`}>
                                            {tech.type || 'Misc'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{tech.description}</p>
                                </div>
                                <button
                                    onClick={() => onEquipAbility(tech)}
                                    title={isEquipped ? 'Unequip this ability' : 'Equip this ability'}
                                    className="text-sm font-semibold py-1 px-3 rounded-md transition-colors whitespace-nowrap
                                               bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                    {isEquipped ? 'Unequip' : 'Equip'}
                                </button>
                            </div>
                        </div>
                     );
                })
            ) : (
                <div className="bg-white p-4 rounded-md">
                    <p className="text-gray-600 italic text-center">You have not yet learned any special abilities.</p>
                </div>
            )}
            </div>
        </div>


        {/* Crew Roster Section */}
        <div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">Crew Roster</h3>
             <div className="max-h-72 overflow-y-auto space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                {crew.length > 0 ? (
                    crew.map(member => (
                        <div key={member.name} className="bg-white p-3 rounded-md border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-bold text-gray-800">{member.name}</p>
                                <span className={`text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full ${getRelationshipColorClass(member.relationship)}`}>
                                    {member.relationship}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{member.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-4 rounded-md">
                        <p className="text-gray-600 italic text-center">You are currently sailing solo.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Reputation Analysis */}
        <div>
            <h3 className="text-xl font-bold text-orange-600 mb-3">Reputation Analysis</h3>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
                <p className="text-gray-700 italic">"{analysis}"</p>
            </div>
        </div>

        {/* Equipment & Inventory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InventoryList 
                title="Outfits"
                items={inventory.outfits}
                equippedItem={loadout.outfit}
                type="outfit"
                onEquip={onEquipItem}
            />
            <InventoryList 
                title="Weapons & Gear"
                items={inventory.weapons}
                equippedItem={loadout.weapon}
                type="weapon"
                onEquip={onEquipItem}
            />
        </div>
      </div>

    </div>
  );
};
