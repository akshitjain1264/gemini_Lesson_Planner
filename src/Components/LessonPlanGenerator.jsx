import React, { useState } from 'react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { table } from 'table';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const LessonPlanGenerator = () => {
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [subUnits, setSubUnits] = useState('');
    const [tableOutput, setTableOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateTable = async () => {
        setLoading(true);
        setError(null);
        setTableOutput(null);

        const schema = {
            description: "Lesson plan details",
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    Duration: {
                        type: SchemaType.STRING,
                        description: "Estimated duration of the lesson",
                        nullable: false,
                    },
                    Guide: {
                        type: SchemaType.STRING,
                        description: "Guidance or instructions for the lesson",
                        nullable: false,
                    },
                    Remarks: {
                        type: SchemaType.STRING,
                        description: "Additional remarks or notes",
                        nullable: true,
                    },
                },
                required: ["Duration", "Guide"],
            },
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const prompt = `Generate a lesson plan table for the following: Topic: ${topic}, Grade: ${grade}, Subject: ${subject}, Sub-units: ${subUnits}. Provide Duration, Guide, and Remarks.`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (responseText) {
                try {
                    const lessonPlans = JSON.parse(responseText);

                    if (Array.isArray(lessonPlans)) {
                        const tableData = [["Duration", "Guide", "Remarks"]];

                        lessonPlans.forEach((plan) => {
                            tableData.push([
                                plan.Duration || "",
                                plan.Guide || "",
                                plan.Remarks || "",
                            ]);
                        });

                        // Generate the table data, but we will render it manually using jsx.
                        setTableOutput(tableData);
                    } else {
                        setError("Response did not return an array of lesson plans.");
                    }
                } catch (jsonError) {
                    setError(`Error parsing JSON response: ${jsonError.message}`);
                    console.error("Raw response text:", responseText);
                }
            } else {
                setError("No response text received.");
            }
        } catch (error) {
            setError(`Error generating content: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Lesson Plan Generator</h2>
                    <form onSubmit={(e) => { e.preventDefault(); generateTable(); }} className="space-y-6">
                        {/* Form inputs... */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Topic:</label>
                            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grade:</label>
                            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject:</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sub-units:</label>
                            <input type="text" value={subUnits} onChange={(e) => setSubUnits(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {loading ? "Generating..." : "Generate Table"}
                        </button>
                    </form>

                    {error && <p className="mt-4 text-red-600">{error}</p>}
                    {tableOutput && (
                        <div className="mt-8 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {tableOutput[0].map((header, index) => (
                                            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tableOutput.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPlanGenerator;