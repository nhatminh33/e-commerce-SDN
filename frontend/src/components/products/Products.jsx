import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { get_products } from '../../store/reducers/homeReducer';
import 'react-multi-carousel/lib/styles.css';

const Products = ({ title }) => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector(state => state.home);

    useEffect(() => {
        dispatch(get_products());
    }, [dispatch]);

    const responsive = {
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
    };

    const ButtonGroup = ({ next, previous }) => (
        <div className='flex justify-between items-center'>
            <div className='text-xl font-bold text-slate-600'>{title}</div>
            <div className='flex gap-3 text-slate-600'>
                <button onClick={previous} className='w-[30px] h-[30px] bg-slate-300 border border-slate-200 flex justify-center items-center'>
                    <IoIosArrowBack />
                </button>
                <button onClick={next} className='w-[30px] h-[30px] bg-slate-300 border border-slate-200 flex justify-center items-center'>
                    <IoIosArrowForward />
                </button>
            </div>
        </div>
    );

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!products || products.length === 0) return <p>No products found.</p>;
    if (!Array.isArray(products) || products.length === 0) {
        return <p>No products found.</p>;
    }

    return (
        <div className='flex gap-8 flex-col-reverse'>
            <Carousel autoPlay={false} infinite={false} arrows={false} responsive={responsive} transitionDuration={500} renderButtonGroupOutside customButtonGroup={<ButtonGroup />} >
                {products.map((p, i) => (
                    <div key={i} className='flex flex-col gap-2'>
                        {Array.isArray(p) ? (
                            p.map((pl, j) => (
                                <Link key={j} to="#" className='flex items-start'>
                                    <img className='w-[110px] h-[110px]' src={pl.images?.[0] || 'fallback-image.jpg'} alt={pl.name || "Product"} />
                                    <div className='px-3 flex flex-col text-slate-600'>
                                        <h2>{pl.name || "No Name"}</h2>
                                        <span className='text-lg font-bold'>${pl.price || "N/A"}</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-red-500">Invalid product structure</p>
                        )}
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default Products;
