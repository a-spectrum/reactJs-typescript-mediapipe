import React, {useEffect, useState} from 'react';
import './styles.css';
import JSZip from "jszip";
import saveAs from 'file-saver';

interface dataType {
    startTime: string;
    gameResetTime: string;
    gamestate: Array<dataTypeTurn>;
    winner: string;
};

interface dataTypeTurn {
    timeChanged: string;
    gameState?: Array<string>;
    tempArray?: Array<string>;
};

export function Analyse() {
    const [dataNoFeet, setDataNoFeet] = useState<Array<dataType>>([]);
    const [dataWithFeet, setDataWithFeet] = useState<Array<dataType>>([]);

    useEffect(() => {
        console.log(dataNoFeet, dataWithFeet)
    }, [dataNoFeet, dataWithFeet])

    const convertTimeToSeconds = (time: string) => {
        const hourStarted: number = 10;
        let startTime: string = time.split(" ")[4];
        let convertedTime: string = startTime + ',';
        let secondsSinceStart: number = 0;
        const startTimeSplit: Array<string> = startTime.split(':');

        if(parseInt(startTimeSplit[0]) > hourStarted) {
            secondsSinceStart = secondsSinceStart + (((parseInt(startTimeSplit[0]) - hourStarted) * 60) * 60);
        }

        secondsSinceStart = secondsSinceStart + parseInt(startTimeSplit[1]) * 60;
        secondsSinceStart = secondsSinceStart + parseInt(startTimeSplit[2]);

        convertedTime += secondsSinceStart + ',';
        return convertedTime;
    }

    const convertDataToString = (data: Array<dataType>) => {
        let dataInCsv: string = 'startTime,startTimeSeconds,gameResetTime,gameResetTimeSeconds,winner,' +
            'amountOfTurns,turn1Time,turn1TimeSeconds,turn1State,turn2Time,turn2TimeSeconds,turn2State,' +
            'turn3Time,turn3TimeSeconds,turn3State,' +
            'turn4Time,turn4TimeSeconds,turn4State,turn5Time,turn5TimeSeconds,turn5State,' +
            'turn6Time,turn6TimeSeconds,turn6State,' +
            'turn7Time,turn7TimeSeconds,turn7State,turn8Time,turn8TimeSeconds,turn8State,' +
            'turn9Time,turn9TimeSeconds,turn9State' +
            '\n';
        data.forEach((dataObject) => {
            // console.log(dataObject);
            dataInCsv += convertTimeToSeconds(dataObject.startTime);
            dataObject.gameResetTime ?
                (dataInCsv += convertTimeToSeconds(dataObject.gameResetTime))
            :
                (dataInCsv += '0,0,')
            ;
            dataObject.winner ?
                (dataInCsv += dataObject.winner + ',')
            :
                (dataInCsv += 'neither,')
            ;

            dataInCsv += (dataObject.gamestate.length - 1) + ',';

            dataObject.gamestate.forEach((turn, index) => {
                if(index > 0) {
                    dataInCsv += convertTimeToSeconds(turn.timeChanged);
                    dataInCsv += JSON.stringify(turn.tempArray).replaceAll(',', '|') + ',';
                    // dataInCsv += 'tempArray,';
                }
            })

            if(dataObject.gamestate.length < 10) {

            }

            dataInCsv += '\n';
        })
        console.log(dataInCsv);
        return dataInCsv;
    }

    const convertToCsv = (name: string, data: string) => {
        // console.log(new Date(Date.now()).toString());
        let zip = new JSZip();
        zip.file(name + '.csv', data);
        zip.generateAsync({type: 'blob'}).then((content) => {
            // @ts-ignore
            saveAs(content, name + '.zip')
        })
    }


    return <article
        className={'analyse'}
    >
        <h2>Analyse</h2>
        <div
            className={'analyse-position'}
        >
            <section
                className={'analyse__input'}
            >
                <h3>No feet</h3>
                <input
                    onChange={(e) => {
                        // @ts-ignore
                        e.target.files.item(0).text().then(file => {setDataNoFeet(JSON.parse(file))})
                    }}
                    type={'file'} />

                <button
                    onClick={() => {
                        convertToCsv('data_no_feet', convertDataToString(dataNoFeet))
                    }}
                >Convert to CSV</button>
            </section>
            <section
                className={'analyse__input'}
            >
                <h3>With feet</h3>
                <input
                    onChange={(e) => {
                        // @ts-ignore
                        e.target.files.item(0).text().then(file => {setDataWithFeet(JSON.parse(file))})
                    }}
                    type={'file'} />

                <button
                    onClick={() => {
                        convertToCsv('data_with_feet', convertDataToString(dataWithFeet))
                    }}
                >Convert to CSV</button>
            </section>
        </div>
        {dataNoFeet.length > 0 && dataNoFeet.map((data, index) => {
            return <section
                className={'gameData'}
                key={data.startTime + index}
            >
                <pre>
                <p>Start:   {data.startTime}</p>
                <p>End:     {data.gameResetTime}</p>
                <p>Winner:  {data.winner}</p>
                <p>Gamestate: </p>
                    {data.gamestate && data.gamestate.length > 0 && data.gamestate.map((turn, index) => {

                        return <ul key={turn.timeChanged + index}>
                            <li>{turn.timeChanged}</li>
                           {turn.gameState ?  <li>{JSON.stringify(turn.gameState)}</li> :  <li>{JSON.stringify(turn.tempArray)}</li>}
                        </ul>
                    })}
                </pre>
            </section>
        })}
    </article>
}
