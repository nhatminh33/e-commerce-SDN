import React from 'react';

const Pagination = ({ pageNumber, setPageNumber, totalItem, perPage, showItem }) => {
    
    let totalPage = Math.ceil(totalItem / perPage);
    let startPage = pageNumber > showItem ? pageNumber - Math.floor(showItem / 2) : 1;
    let endPage = startPage + showItem - 1;
    
    if (endPage > totalPage) {
        endPage = totalPage;
        startPage = endPage - showItem + 1;
        if (startPage < 1) {
            startPage = 1;
        }
    }

    const createButtons = () => {
        const btns = [];
        for (let i = startPage; i <= endPage; i++) {
            btns.push(
                <li key={i} className={`
                    inline-block 
                    ${pageNumber === i ? 'bg-indigo-500 text-white' : 'bg-[#6a5fdf]'} 
                    px-3 py-1 rounded-md mx-1 cursor-pointer
                    hover:bg-indigo-500 hover:text-white
                    transition-all
                `}
                onClick={() => setPageNumber(i)}
                >
                    {i}
                </li>
            );
        }
        return btns;
    };

    return (
        <ul className="flex">
            {
                pageNumber > 1 && 
                <li 
                    onClick={() => setPageNumber(pageNumber - 1)} 
                    className="bg-[#6a5fdf] px-3 py-1 rounded-md mx-1 cursor-pointer hover:bg-indigo-500 hover:text-white transition-all"
                >
                    &lt;
                </li>
            }
            {createButtons()}
            {
                pageNumber < totalPage && 
                <li 
                    onClick={() => setPageNumber(pageNumber + 1)} 
                    className="bg-[#6a5fdf] px-3 py-1 rounded-md mx-1 cursor-pointer hover:bg-indigo-500 hover:text-white transition-all"
                >
                    &gt;
                </li>
            }
        </ul>
    );
};

export default Pagination; 