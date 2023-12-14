import { useState } from "react";

export interface ListSelections<T> {
    selections: T[];
    addSelection: (item: T) => void;
    addSelections: (items: T[]) => void;
    removeSelection: (item: T) => void;
    toggleSelection: (item: T) => void;
    clearSelections: () => void;
    isSelected: (item: T) => boolean;
}

export default function useListSelections<T>(itemsEqual: (a: T, b: T) => boolean): ListSelections<T> {
    const [selections, setSelections] = useState<T[]>([]);

    const isSelected = (itemA: T) => {
        return !!selections.find(itemB => itemsEqual(itemA, itemB));
    }

    const addSelection = (item: T) => {
        setSelections(prev => [...prev, item]);
    }

    const addSelections = (items: T[]) => {
        setSelections(prev => [...prev, ...items]);
    }

    const removeSelection = (itemA: T) => {
        setSelections(prev => prev.filter(itemB => !itemsEqual(itemA, itemB)));
    }

    const toggleSelection = (item: T) => {
        isSelected(item) ?
            removeSelection(item) :
            addSelection(item);
    }

    const clearSelections = () => {
        setSelections([]);
    }

    return {
        selections,
        isSelected,
        addSelection,
        addSelections,
        removeSelection,
        toggleSelection,
        clearSelections,
    };
}