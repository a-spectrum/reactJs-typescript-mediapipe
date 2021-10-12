import React, {useEffect} from 'react';
import './styles.css';

interface properties {
    x: number;
    y: number;
    percent: number;
}

export function Feedback({x, y, percent}: properties) {
    const MAX_TIME_BEFORE_EVENT: number = 2000;

    // const calculatePercentage = (currentTime: number) => {
    //     let width: string = '120px';
    //
    //     if (currentTime < MAX_TIME_BEFORE_EVENT) {
    //         let answer: number;
    //         answer = Math.floor(currentTime / (MAX_TIME_BEFORE_EVENT / 100));
    //         width = 100 - answer + 'px';
    //     } else {
    //         width = '0px';
    //     }
    //     return width;
    // }

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    const  describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        // http://jsbin.com/quhujowota/1/edit?html,js,output
        let start = polarToCartesian(x, y, radius, endAngle);
        let end = polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= 180 ? "1" : "0";

        let result = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
        ].join(" ");

        return endAngle === 0 ? "" : result;
    }


    const setProgress = (currentTime: number) => {

        let percentage: number = 0;
        if (currentTime < MAX_TIME_BEFORE_EVENT) {
            // Calculate percentage of 100%
            percentage = Math.floor(currentTime / (MAX_TIME_BEFORE_EVENT / 100));
        }

        let endAngle = (3.6 * percentage);
        endAngle > 340 && (endAngle = 340);
        endAngle < 0 && (endAngle = 0);
        // console.log(describeArc(50, 50, 30, 0, endAngle));

        return describeArc(50, 50, 30, 0, endAngle);
    }

    useEffect(() => {
    }, [])

    return <div
        id={'loadingBar'}
            className={'loader'}
            style={{
                position: "absolute",
                // backgroundColor: 'blue',
                top: y -50,
                left: x -50,
                zIndex: 10,
                // width: calculatePercentage(percent),
                // height: '16px',
            }}
    >
        <svg
            className="progress-ring"
            width="120"
            height="120">
            <path
                id="progressArc"
                fill="none"
                stroke="#eb3b5a"
                strokeWidth="20"
                strokeLinecap={'round'}
                d={setProgress(percent)}
            />
        </svg>
    </div>
    // <div
    //     id={'loadingBar'}
    //     className={'loader'}
    //     style={{
    //         position: "absolute",
    //         backgroundColor: 'blue',
    //         top: y,
    //         left: x,
    //         zIndex: 10,
    //         width: calculatePercentage(percent),
    //         // height: '16px',
    //     }}
    // />
}
