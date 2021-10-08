import React, {Ref, useEffect, useState} from "react";

export const getElementCoordinates = (element: React.RefObject<HTMLDivElement>) => {
    let coordinates = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    };
    if (element.current) {
        const offsets = element.current.getBoundingClientRect();

        coordinates.top = offsets.top;
        coordinates.bottom = offsets.bottom;
        coordinates.left = offsets.left;
        coordinates.right = offsets.right;
    };

    return coordinates;
}

