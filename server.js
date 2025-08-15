const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

const DB_FILE = './db.json';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Middleware
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser.json());

// API routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading database' });
        }

        const db = JSON.parse(data);
        const user = db.users.find(u => u.username === username && u.password === password);

        if (user) {
            res.json({ success: true, user: { username: user.username, role: user.role } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, role } = req.body;

    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading database' });
        }

        const db = JSON.parse(data);

        if (db.users.find(u => u.username === username)) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const newUser = {
            id: db.users.length + 1,
            username,
            password, // In a real app, hash this!
            role
        };

        db.users.push(newUser);

        fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error saving user' });
            }
            res.json({ success: true, user: { username: newUser.username, role: newUser.role } });
        });
    });
});

app.post('/api/question', async (req, res) => {
    const { year, difficulty } = req.body; // Difficulty will be used later for adaptive learning

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ success: false, message: 'Gemini API key not configured' });
    }

    const topics = {
        5: [
            "Read, write, order and compare numbers to at least 1,000,000",
            "Count forwards or backwards in steps of powers of 10 for any given number up to 1,000,000",
            "Interpret negative numbers in context",
            "Round any number up to 1,000,000 to the nearest 10, 100, 1,000, 10,000 and 100,000",
            "Read Roman numerals to 1,000 (M)",
            "Add and subtract whole numbers with more than 4 digits",
            "Add and subtract numbers mentally with increasingly large numbers",
            "Use rounding to check answers",
            "Identify multiples and factors",
            "Know and use the vocabulary of prime numbers, prime factors and composite numbers",
            "Establish whether a number up to 100 is prime and recall prime numbers up to 19",
            "Multiply numbers up to 4 digits by a one- or two-digit number",
            "Divide numbers up to 4 digits by a one-digit number",
            "Multiply and divide whole numbers and those involving decimals by 10, 100 and 1,000",
            "Recognise and use square numbers and cube numbers",
            "Compare and order fractions whose denominators are all multiples of the same number",
            "Recognise mixed numbers and improper fractions and convert from one form to the other",
            "Add and subtract fractions with the same denominator and denominators that are multiples of the same number",
            "Multiply proper fractions and mixed numbers by whole numbers",
            "Read and write decimal numbers as fractions",
            "Round decimals with 2 decimal places to the nearest whole number and to 1 decimal place",
            "Read, write, order and compare numbers with up to 3 decimal places",
            "Solve problems involving percentage and decimal equivalents of 1/2, 1/4, 1/5, 2/5, 4/5",
            "Convert between different units of metric measure",
            "Measure and calculate the perimeter of composite rectilinear shapes",
            "Calculate and compare the area of rectangles",
            "Estimate volume and capacity",
            "Identify 3-D shapes from 2-D representations",
            "Know angles are measured in degrees: estimate and compare acute, obtuse and reflex angles",
            "Solve comparison, sum and difference problems using information presented in a line graph"
        ],
        6: [
            "Read, write, order and compare numbers up to 10,000,000",
            "Round any whole number to a required degree of accuracy",
            "Use negative numbers in context, and calculate intervals across 0",
            "Multiply multi-digit numbers up to 4 digits by a two-digit whole number",
            "Divide numbers up to 4 digits by a two-digit whole number",
            "Perform mental calculations, including with mixed operations and large numbers",
            "Identify common factors, common multiples and prime numbers",
            "Use common factors to simplify fractions; use common multiples to express fractions in the same denomination",
            "Compare and order fractions, including fractions >1",
            "Add and subtract fractions with different denominators and mixed numbers",
            "Multiply simple pairs of proper fractions",
            "Divide proper fractions by whole numbers",
            "Associate a fraction with division and calculate decimal fraction equivalents",
            "Solve problems involving the calculation of percentages",
            "Solve problems involving similar shapes where the scale factor is known or can be found",
            "Solve problems involving unequal sharing and grouping",
            "Use simple formulae",
            "Generate and describe linear number sequences",
            "Express missing number problems algebraically",
            "Find pairs of numbers that satisfy an equation with 2 unknowns",
            "Calculate the area of parallelograms and triangles",
            "Calculate, estimate and compare volume of cubes and cuboids",
            "Illustrate and name parts of circles, including radius, diameter and circumference",
            "Describe positions on the full coordinate grid (all 4 quadrants)",
            "Interpret and construct pie charts and line graphs",
            "Calculate and interpret the mean as an average"
        ],
        7: [
            "Understand and use place value for decimals, measures and integers of any size",
            "Order positive and negative integers, decimals and fractions",
            "Use the concepts and vocabulary of prime numbers, factors, multiples, common factors, common multiples, highest common factor, lowest common multiple, prime factorisation",
            "Use the 4 operations, including formal written methods, applied to integers, decimals, proper and improper fractions, and mixed numbers, all both positive and negative",
            "Use integer powers and associated real roots (square, cube and higher)",
            "Work interchangeably with terminating decimals and their corresponding fractions",
            "Define percentage as ‘number of parts per hundred’",
            "Use standard units of mass, length, time, money and other measures, including with decimal quantities",
            "Round numbers and measures to an appropriate degree of accuracy",
            "Use and interpret algebraic notation",
            "Simplify and manipulate algebraic expressions",
            "Solve linear equations in 1 variable",
            "Work with coordinates in all 4 quadrants",
            "Recognise, sketch and produce graphs of linear and quadratic functions of 1 variable",
            "Use linear and quadratic graphs to estimate values",
            "Generate terms of a sequence from either a term-to-term or a position-to-term rule",
            "Recognise arithmetic sequences and find the nth term",
            "Use scale factors, scale diagrams and maps",
            "Divide a given quantity into 2 parts in a given part:part or part:whole ratio",
            "Solve problems involving percentage change",
            "Solve problems involving direct and inverse proportion",
            "Derive and apply formulae to calculate and solve problems involving: perimeter and area of triangles, parallelograms, trapezia, volume of cuboids",
            "Calculate and solve problems involving: perimeters of 2-D shapes (including circles), areas of circles and composite shapes",
            "Describe, sketch and draw using conventional terms and notations: points, lines, parallel lines, perpendicular lines, right angles, regular polygons",
            "Apply the properties of angles at a point, angles at a point on a straight line, vertically opposite angles",
            "Understand and use the relationship between parallel lines and alternate and corresponding angles",
            "Derive and use the sum of angles in a triangle and use it to deduce the angle sum in any polygon",
            "Record, describe and analyse the frequency of outcomes of simple probability experiments",
            "Enumerate sets and unions/intersections of sets systematically, using tables, grids and Venn diagrams",
            "Describe, interpret and compare observed distributions of a single variable through: appropriate graphical representation involving discrete, continuous and grouped data; and appropriate measures of central tendency"
        ],
        8: [
            "Number properties (prime, composite, factors, multiples, HCF, LCM)",
            "Integers (positive and negative)",
            "Decimals",
            "Fractions",
            "Rational numbers",
            "Indices, roots and standard form",
            "Expressions and formulae",
            "Linear equations",
            "Coordinates",
            "Graphs of linear and quadratic functions",
            "Sequences",
            "Ratios and proportions",
            "Percentages",
            "Compound units",
            "2D shapes (triangles, quadrilaterals, polygons, circles)",
            "Angles",
            "3D shapes",
            "Perimeter, area and volume",
            "Transformations (translations, rotations, reflections)",
            "Pythagoras' theorem",
            "Simple probability",
            "Compound events",
            "Central tendency (mean, mode, median) and spread (range)",
            "Charts and graphs (bar charts, pie charts, line graphs, stem-and-leaf plots, scatter plots)"
        ],
        9: [
            "Number and place value (including standard form)",
            "Integers, decimals, fractions and rational numbers",
            "Powers and roots",
            "Expressions, formulae and equations",
            "Linear and quadratic functions",
            "Sequences",
            "Ratios and proportions",
            "Percentages",
            "Direct and inverse proportion",
            "2D and 3D shapes",
            "Angles",
            "Perimeter, area and volume",
            "Transformations",
            "Pythagoras' theorem and trigonometry",
            "Simple and compound events",
            "Central tendency and spread",
            "Charts, graphs and tables"
        ],
        10: [
            "Rational and irrational numbers",
            "Indices and roots",
            "Standard form",
            "Expressions, formulae and equations",
            "Linear, quadratic and simultaneous equations",
            "Inequalities",
            "Functions",
            "Ratios and proportions",
            "Percentages",
            "Direct and inverse proportion",
            "2D and 3D shapes",
            "Angles",
            "Perimeter, area and volume",
            "Transformations",
            "Pythagoras' theorem and trigonometry",
            "Vectors",
            "Simple and compound events",
            "Conditional probability",
            "Central tendency and spread",
            "Charts, graphs and tables",
            "Scatter graphs"
        ]
    };

    const yearTopics = topics[year] || topics[5]; // Default to year 5 topics if year not found
    const topic = yearTopics[Math.floor(Math.random() * yearTopics.length)];

    const prompt = `You are an expert in the British mathematics curriculum. Generate a math question for a Year ${year} student in the UK, focusing on the topic: "${topic}". The question should be a word problem. Return the response as a JSON object with three keys: "question", "answer", and "topic". The "question" should be a string containing the word problem. The "answer" must be a single number (integer or decimal). The "topic" should be the topic provided in the prompt. Do not include any units or symbols in the answer, only the numeric value.`;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
        });

        let content = response.data.candidates[0].content.parts[0].text;

        // Clean the response to ensure it's valid JSON
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsedContent = JSON.parse(content);

            if (isNaN(parsedContent.answer)) {
                throw new Error("Answer is not a number.");
            }

            res.json({
                success: true,
                question: parsedContent.question,
                answer: parsedContent.answer,
                topic: parsedContent.topic
            });
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError.message);
            console.error('Original Gemini response:', content);
            res.status(500).json({ success: false, message: 'Failed to parse question from AI. The AI returned an invalid format.' });
        }

    } catch (error) {
        console.error('Error fetching question from Gemini:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to generate question' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
