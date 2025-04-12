import React, { useState } from 'react';
import './Roadmap.css';
import roadmap from "../../../backend/src/constants/processedData/finalData.json";

const Roadmap = () => {
    const [selectedUnit, setSelectedUnit] = useState<string>("1");
    const [displayData, setDisplayData] = useState<Record<string, any> | null>(null);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUnit(event.target.value);
    };

    const handleSubmit = () => {
        const sectionKey = (parseInt(selectedUnit) - 1).toString();
        const selectedData = (roadmap as Record<string, any>)[sectionKey];
        setDisplayData(selectedData);
    };

    return (
        <div>
          <div className='containering'>
            <div className='top-part'>
          <h1>Your Very Own Personalised Roadmap</h1>
          <div className='input'>
            <label htmlFor="roadmap">Choose Unit:</label>
            <select id="roadmap" name="roadmap" onChange={handleSelectChange} value={selectedUnit}>
                {Object.entries(roadmap).map(([sectionKey]) => {
                    const displayNumber = parseInt(sectionKey) + 1;
                    return (
                        <option key={sectionKey} value={displayNumber.toString()}>
                            Unit {displayNumber}
                        </option>
                    );
                })}
            </select>
            <button onClick={handleSubmit}>Submit</button>
            </div>
            </div>

            <div className='output'>
            {displayData && (
                <div className="roadmap-content">
                    <h2 className='unit-title'>Unit {selectedUnit}</h2>
                    {Object.entries(displayData).map(([key, value]) => (
                        <div className="topic-card" key={key}>
                            <h3>{value.title}</h3>
                            <p>{value.summary}</p>
                            <p className='padding'>Here are some video links that migh tbe helpful for u to learn about the topic {value.title}</p>
                            {value.links && Object.keys(value.links).length > 0 && (
                                <ul>
                                    {Object.values(value.links).map((linkUrl, index) => (
                                      <li key={index}>
                                        <a href={String(linkUrl)} target="_blank" rel="noopener noreferrer">
                                          Link {index + 1}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </div>
            </div>
        </div>
    );
};

export default Roadmap;
