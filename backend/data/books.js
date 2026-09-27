// In-memory demo data.
// Swap for a real database (Postgres, SQLite, etc.) when you're ready.
// Every route in routes/books.js can continue using this array.

let books = [
  { id: "1", title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Sci-Fi", available: true, year: 1969 },
  { id: "2", title: "Kindred", author: "Octavia E. Butler", genre: "Sci-Fi", available: false, year: 1979 },
  { id: "3", title: "Piranesi", author: "Susanna Clarke", genre: "Fantasy", available: true, year: 2020 },
  { id: "4", title: "The Sympathizer", author: "Viet Thanh Nguyen", genre: "Fiction", available: true, year: 2015 },
  { id: "5", title: "Circe", author: "Madeline Miller", genre: "Fantasy", available: false, year: 2018 },
  { id: "6", title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", genre: "Nonfiction", available: true, year: 2013 },
  { id: "7", title: "The Overstory", author: "Richard Powers", genre: "Fiction", available: true, year: 2018 },
  { id: "8", title: "Exhalation", author: "Ted Chiang", genre: "Sci-Fi", available: false, year: 2019 },

  { id: "9", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", available: true, year: 1965 },
  { id: "10", title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi", available: true, year: 1951 },
  { id: "11", title: "1984", author: "George Orwell", genre: "Fiction", available: false, year: 1949 },
  { id: "12", title: "Brave New World", author: "Aldous Huxley", genre: "Sci-Fi", available: true, year: 1932 },
  { id: "13", title: "Fahrenheit 451", author: "Ray Bradbury", genre: "Sci-Fi", available: true, year: 1953 },
  { id: "14", title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", available: true, year: 1937 },
  { id: "15", title: "The Fellowship of the Ring", author: "J.R.R. Tolkien", genre: "Fantasy", available: false, year: 1954 },
  { id: "16", title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", available: true, year: 2007 },
  { id: "17", title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy", available: true, year: 2010 },
  { id: "18", title: "Mistborn", author: "Brandon Sanderson", genre: "Fantasy", available: false, year: 2006 },

  { id: "19", title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", available: true, year: 1813 },
  { id: "20", title: "Jane Eyre", author: "Charlotte Brontë", genre: "Fiction", available: true, year: 1847 },
  { id: "21", title: "Wuthering Heights", author: "Emily Brontë", genre: "Fiction", available: false, year: 1847 },
  { id: "22", title: "Little Women", author: "Louisa May Alcott", genre: "Fiction", available: true, year: 1868 },
  { id: "23", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", available: true, year: 1925 },
  { id: "24", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", available: false, year: 1960 },
  { id: "25", title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", available: true, year: 1951 },

  { id: "26", title: "The Book Thief", author: "Markus Zusak", genre: "Historical", available: true, year: 2005 },
  { id: "27", title: "All the Light We Cannot See", author: "Anthony Doerr", genre: "Historical", available: false, year: 2014 },
  { id: "28", title: "The Nightingale", author: "Kristin Hannah", genre: "Historical", available: true, year: 2015 },
  { id: "29", title: "A Thousand Splendid Suns", author: "Khaled Hosseini", genre: "Fiction", available: true, year: 2007 },
  { id: "30", title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction", available: false, year: 2003 },

  { id: "31", title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", available: true, year: 2019 },
  { id: "32", title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", available: true, year: 2012 },
  { id: "33", title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", available: false, year: 2005 },
  { id: "34", title: "Big Little Lies", author: "Liane Moriarty", genre: "Mystery", available: true, year: 2014 },
  { id: "35", title: "The Da Vinci Code", author: "Dan Brown", genre: "Mystery", available: true, year: 2003 },
  { id: "36", title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery", available: false, year: 1939 },
  { id: "37", title: "Murder on the Orient Express", author: "Agatha Christie", genre: "Mystery", available: true, year: 1934 },

  { id: "38", title: "Sapiens", author: "Yuval Noah Harari", genre: "Nonfiction", available: true, year: 2011 },
  { id: "39", title: "Homo Deus", author: "Yuval Noah Harari", genre: "Nonfiction", available: false, year: 2015 },
  { id: "40", title: "Educated", author: "Tara Westover", genre: "Biography", available: true, year: 2018 },
  { id: "41", title: "Becoming", author: "Michelle Obama", genre: "Biography", available: true, year: 2018 },
  { id: "42", title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", available: false, year: 2011 },
  { id: "43", title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography", available: true, year: 1994 },

  { id: "44", title: "Atomic Habits", author: "James Clear", genre: "Self-Help", available: true, year: 2018 },
  { id: "45", title: "The Power of Habit", author: "Charles Duhigg", genre: "Self-Help", available: false, year: 2012 },
  { id: "46", title: "Think and Grow Rich", author: "Napoleon Hill", genre: "Self-Help", available: true, year: 1937 },
  { id: "47", title: "How to Win Friends and Influence People", author: "Dale Carnegie", genre: "Self-Help", available: true, year: 1936 },
  { id: "48", title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genre: "Self-Help", available: false, year: 1989 },

  { id: "49", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", available: true, year: 1988 },
  { id: "50", title: "Cosmos", author: "Carl Sagan", genre: "Science", available: true, year: 1980 },
  { id: "51", title: "The Selfish Gene", author: "Richard Dawkins", genre: "Science", available: false, year: 1976 },
  { id: "52", title: "The Gene", author: "Siddhartha Mukherjee", genre: "Science", available: true, year: 2016 },
  { id: "53", title: "Silent Spring", author: "Rachel Carson", genre: "Science", available: true, year: 1962 },

  { id: "54", title: "Clean Code", author: "Robert C. Martin", genre: "Technology", available: false, year: 2008 },
  { id: "55", title: "The Pragmatic Programmer", author: "Andrew Hunt", genre: "Technology", available: true, year: 1999 },
  { id: "56", title: "Design Patterns", author: "Erich Gamma", genre: "Technology", available: true, year: 1994 },
  { id: "57", title: "Introduction to Algorithms", author: "Thomas H. Cormen", genre: "Technology", available: false, year: 1990 },
  { id: "58", title: "Code Complete", author: "Steve McConnell", genre: "Technology", available: true, year: 2004 },
  { id: "59", title: "You Don't Know JS", author: "Kyle Simpson", genre: "Technology", available: true, year: 2015 },
  { id: "60", title: "Eloquent JavaScript", author: "Marijn Haverbeke", genre: "Technology", available: false, year: 2018 },

  { id: "61", title: "The Intelligent Investor", author: "Benjamin Graham", genre: "Finance", available: true, year: 1949 },
  { id: "62", title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", genre: "Finance", available: true, year: 1997 },
  { id: "63", title: "The Psychology of Money", author: "Morgan Housel", genre: "Finance", available: false, year: 2020 },
  { id: "64", title: "Think Like a Monk", author: "Jay Shetty", genre: "Self-Help", available: true, year: 2020 },
  { id: "65", title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", genre: "Business", available: true, year: 2020 },

  { id: "66", title: "Zero to One", author: "Peter Thiel", genre: "Business", available: false, year: 2014 },
  { id: "67", title: "Good to Great", author: "Jim Collins", genre: "Business", available: true, year: 2001 },
  { id: "68", title: "The Lean Startup", author: "Eric Ries", genre: "Business", available: true, year: 2011 },
  { id: "69", title: "Start with Why", author: "Simon Sinek", genre: "Business", available: false, year: 2009 },
  { id: "70", title: "The 4-Hour Workweek", author: "Timothy Ferriss", genre: "Business", available: true, year: 2007 },

  { id: "71", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Psychology", available: true, year: 2011 },
  { id: "72", title: "Man's Search for Meaning", author: "Viktor E. Frankl", genre: "Psychology", available: false, year: 1946 },
  { id: "73", title: "The Power of Now", author: "Eckhart Tolle", genre: "Self-Help", available: true, year: 1997 },
  { id: "74", title: "Emotional Intelligence", author: "Daniel Goleman", genre: "Psychology", available: true, year: 1995 },
  { id: "75", title: "Quiet", author: "Susan Cain", genre: "Psychology", available: false, year: 2012 },

  { id: "76", title: "The Republic", author: "Plato", genre: "Philosophy", available: true, year: -380 },
  { id: "77", title: "Meditations", author: "Marcus Aurelius", genre: "Philosophy", available: true, year: 180 },
  { id: "78", title: "Beyond Good and Evil", author: "Friedrich Nietzsche", genre: "Philosophy", available: false, year: 1886 },
  { id: "79", title: "The Art of War", author: "Sun Tzu", genre: "Philosophy", available: true, year: -500 },
  { id: "80", title: "Letters from a Stoic", author: "Seneca", genre: "Philosophy", available: true, year: 65 },

  { id: "81", title: "Guns, Germs, and Steel", author: "Jared Diamond", genre: "History", available: false, year: 1997 },
  { id: "82", title: "The Silk Roads", author: "Peter Frankopan", genre: "History", available: true, year: 2015 },
  { id: "83", title: "A People's History of the United States", author: "Howard Zinn", genre: "History", available: true, year: 1980 },
  { id: "84", title: "SPQR", author: "Mary Beard", genre: "History", available: false, year: 2015 },
  { id: "85", title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Biography", available: true, year: 1947 },

  { id: "86", title: "The Martian", author: "Andy Weir", genre: "Sci-Fi", available: true, year: 2011 },
  { id: "87", title: "Project Hail Mary", author: "Andy Weir", genre: "Sci-Fi", available: false, year: 2021 },
  { id: "88", title: "Neuromancer", author: "William Gibson", genre: "Sci-Fi", available: true, year: 1984 },
  { id: "89", title: "Snow Crash", author: "Neal Stephenson", genre: "Sci-Fi", available: true, year: 1992 },
  { id: "90", title: "The Three-Body Problem", author: "Liu Cixin", genre: "Sci-Fi", available: false, year: 2008 },

  { id: "91", title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", available: true, year: 1988 },
  { id: "92", title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", genre: "Fiction", available: true, year: 1967 },
  { id: "93", title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", available: false, year: 2020 },
  { id: "94", title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Fiction", available: true, year: 2018 },
  { id: "95", title: "Normal People", author: "Sally Rooney", genre: "Romance", available: true, year: 2018 },

  { id: "96", title: "The Fault in Our Stars", author: "John Green", genre: "Romance", available: false, year: 2012 },
  { id: "97", title: "Me Before You", author: "Jojo Moyes", genre: "Romance", available: true, year: 2012 },
  { id: "98", title: "The Notebook", author: "Nicholas Sparks", genre: "Romance", available: true, year: 1996 },
  { id: "99", title: "The Time Traveler's Wife", author: "Audrey Niffenegger", genre: "Romance", available: false, year: 2003 },
  { id: "100", title: "The Midnight Club", author: "Christopher Pike", genre: "Mystery", available: true, year: 1994 }
];

// Export the books array
module.exports = books;