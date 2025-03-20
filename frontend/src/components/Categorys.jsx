import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_category } from '../store/reducers/homeReducer';
import 'react-multi-carousel/lib/styles.css';

const Categorys = () => {
    const dispatch = useDispatch();
    const { categorys, loading, error } = useSelector(state => {
        console.log("Redux State:", state.home);
        return state.home;
    });

    useEffect(() => {
        console.log("Dispatching get_category...");
        dispatch(get_category());
    }, [dispatch]);

    const responsive = {
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 6 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 4 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 3 },
    };

    if (loading) return <p>Loading categories...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!categorys || categorys.length === 0) return <p>No categories found.</p>;

    return (
        <div className='w-[87%] mx-auto'>
            <div className='text-center text-3xl text-slate-600 font-bold pb-4'>
                <h2>Top Categories</h2>
                <div className='w-[100px] h-[2px] bg-[#059473] mt-4'></div>
            </div>
            <Carousel autoPlay infinite arrows responsive={responsive} transitionDuration={500}>
                {categorys.map((c, i) => (
                    <Link key={i} to={`/products?category=${c.name}`} className='h-[185px] border block'>
                        <div className='relative p-3'>
                            <img src={c.image} alt={c.name} />
                            <div className='absolute bottom-6 w-full text-center font-bold bg-[#3330305d] text-white py-[2px] px-6'>{c.name}</div>
                        </div>
                    </Link>
                ))}
            </Carousel>
        </div>
    );
};

export default Categorys;
