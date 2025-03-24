// import React, { useEffect, useState } from 'react';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { IoIosArrowForward } from "react-icons/io"; 
// import Carousel from 'react-multi-carousel'; 
// import 'react-multi-carousel/lib/styles.css'
// import Rating from '../components/Rating';
// import { FaHeart } from "react-icons/fa6";
// import { FaFacebookF} from "react-icons/fa";
// import { FaTwitter } from "react-icons/fa6";
// import { FaLinkedin } from "react-icons/fa";
// import { FaGithub } from "react-icons/fa";
// import { IoChatbubbleEllipses } from "react-icons/io5";
// import ProductChat from '../components/ProductChat';
// import Reviews from '../components/Reviews';
// import {Pagination } from 'swiper/modules';
// import 'swiper/css'; 
// import 'swiper/css/pagination';
// import {Swiper, SwiperSlide } from 'swiper/react';
// import { useDispatch, useSelector } from 'react-redux';
// import { product_details } from '../store/reducers/homeReducer';
// import toast from 'react-hot-toast';
// import { add_to_card,messageClear,add_to_wishlist } from '../store/reducers/cardReducer';
 

// const Details = () => {

//     const navigate = useNavigate()
//     const {_id} = useParams()
//     const dispatch = useDispatch()
//     const {product} = useSelector(state => state.home)
//     const {userInfo } = useSelector(state => state.auth)
//     const {errorMessage,successMessage } = useSelector(state => state.card)
//     const [showChat, setShowChat] = useState(false);

//     useEffect(() => {
//         dispatch(product_details(_id))
//     },[_id])
   
//     useEffect(() => { 
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())  
//         } 
//         if (errorMessage) {
//             toast.error(errorMessage)
//             dispatch(messageClear())  
//         } 
        
//     },[successMessage,errorMessage])

    

//     const images = [1,2,3,4,5,6]
//     const [image, setImage] = useState('')
//     const discount = 10
//     const stock = 3
//     const [state, setState] = useState('reviews')

//     const responsive = {
//         superLargeDesktop: {
//             breakpoint: { max: 4000, min: 3000 },
//             items: 5
//         },
//         desktop: {
//             breakpoint: { max: 3000, min: 1024 },
//             items: 5
//         },
//         tablet: {
//             breakpoint: { max: 1024, min: 464 },
//             items: 4
//         },
//         mdtablet: {
//             breakpoint: { max: 991, min: 464 },
//             items: 4
//         },
//         mobile: {
//             breakpoint: { max: 464, min: 0 },
//             items: 3
//         },
//         smmobile: {
//             breakpoint: { max: 640, min: 0 },
//             items: 2
//         },
//         xsmobile: {
//             breakpoint: { max: 440, min: 0 },
//             items: 1
//         },
//     }

//     const [quantity, setQuantity] = useState(1)

//     const inc = () => {
//         if (quantity >= product.stock) {
//             toast.error('Out of Stock')
//         } else {
//             setQuantity(quantity + 1)
//         }
//     }

//     const dec = () => {
//         if (quantity > 1) {
//             setQuantity(quantity - 1)
//         }
//     }

//     const add_card = () => {
//         if (userInfo) {
//            dispatch(add_to_card({
//             userId: userInfo.id,
//             quantity,
//             productId : product._id
//            }))
//         } else {
//             navigate('/login')
//         }
//     }

//     const add_wishlist = () => {
//         if (userInfo) {
//             dispatch(add_to_wishlist({
//                 userId: userInfo.id,
//                 productId: product._id,
//             }))
//         } else {
//             navigate('/login')
//         }
       
//     }

//    const buynow = () => {
//         let price = 0;
//         if (product.discount !== 0) {
//             price = product.price - Math.floor((product.price * product.discount) / 100)
//         } else {
//             price = product.price
//         }

//         const obj = [
//             {
//                 sellerId: product.sellerId,
//                 shopName: product.shopName,
//                 price :  quantity * (price - Math.floor((price * 5) / 100)),
//                 products : [
//                     {
//                         quantity,
//                         productInfo: product
//                     }
//                 ]
//             }
//         ]
        
//         navigate('/shipping',{
//             state: {
//                 products : obj,
//                 price: price * quantity,
//                 shipping_fee : 50,
//                 items: 1
//             }
//         }) 
//    }

//     const chatWithSeller = () => {
//         if (!userInfo) {
//             toast.error("Vui lòng đăng nhập để chat với người bán");
//             navigate('/login');
//             return;
//         }
        
//         if (!product || !product.sellerId) {
//             toast.error("Không tìm thấy thông tin người bán");
//             return;
//         }
        
//         if (userInfo.role !== 'customer') {
//             toast.error("Chỉ khách hàng mới có thể chat với người bán");
//             console.error("User role không phải customer:", userInfo.role);
//             return;
//         }
        
//         console.log("Product:", product);
//         console.log("Seller ID:", product.sellerId);
//         console.log("User Info:", userInfo);
        
//         setShowChat(true);
//     }

//     return (
//         <div>
//             {showChat && product?.sellerId && (
//                 <ProductChat 
//                     sellerId={typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}
//                     sellerInfo={{
//                         name: typeof product.sellerId === 'object' ? product.sellerId.name : product.shopName,
//                         shopName: typeof product.sellerId === 'object' ? product.sellerId.shopName : product.shopName,
//                         avatar: typeof product.sellerId === 'object' ? product.sellerId.image : null
//                     }}
//                     productId={_id}
//                     productName={product.name}
//                     onClose={() => setShowChat(false)}
//                 />
//             )}
            
//             <Header/>
//     <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
//     <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
//         <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
//             <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
//         <h2 className='text-3xl font-bold'>Product Details </h2>
//         <div className='flex justify-center items-center gap-2 text-2xl w-full'>
//                 <Link to='/'>Home</Link>
//                 <span className='pt-1'>
//                 <IoIosArrowForward />
//                 </span>
//                 <span>Product Details </span>
//                 </div>
//             </div> 
//         </div> 
//     </div> 
//     </section>

//     <section>
//         <div className='bg-slate-100 py-5 mb-5'>
//             <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
//                 <div className='flex justify-start items-center text-md text-slate-600 w-full'>
//                     <Link to='/'>Home</Link>
//                     <span className='pt-1'><IoIosArrowForward /></span>
//                     <Link to='/'>{ product.categoryId?.name || "Không có danh mục" }</Link>
//                     <span className='pt-1'><IoIosArrowForward /></span>
//                     <span>{ product.name } </span>
//                 </div>

//             </div>
//         </div>
//     </section>

//         <section>
//         <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto pb-16'>
//             <div className='grid grid-cols-2 md-lg:grid-cols-1 gap-8'>
//                 <div>
//                 <div className='p-5 border'>
//                     <img className='h-[400px] w-full' src={image ? image : product.images?.[0] } alt="" />
//                 </div>
//             <div className='py-3'>
//                 {
//                     product.images && <Carousel
//                     autoPlay={true}
//                     infinite={true} 
//                     responsive={responsive}
//                     transitionDuration={500}
//                 >
//                     { 
//                        product.images.map((img, i) => {
//                         return (
//                             <div key={i}  onClick={() => setImage(img)}>
//                    <img className='h-[120px] cursor-pointer' src={img} alt="" /> 
//                             </div>
//                         )
//                        })
//                     } 

//                 </Carousel>
//                 }
//            </div>    
//            </div>

//         <div className='flex flex-col gap-5'>
//                 <div className='text-3xl text-slate-600 font-bold'>
//                     <h3>{product.name}</h3>
//                 </div>
//                 <div className='flex justify-start items-center gap-4'>
//                     <div className='flex text-xl'>
//                         <Rating ratings={product.rating} />
//                     </div>
//                     <span className='text-green-500'>(24 reviews)</span> 
//                 </div>

//          <div className='text-2xl text-red-500 font-bold flex gap-3'>
//             {
//                 product.discount !== 0 ? <>
//                 Price : <h2 className='line-through'>${product.price}</h2>
//                 <h2>${product.price - Math.floor((product.price * product.discount) / 100)} (-{product.discount}%) </h2>
                
//                 </> : <h2> Price : ${product.price} </h2>
//             }
//           </div> 

//           <div className='text-slate-600'>
//             <p>{product.description}</p>
//             <p className='text-slate-600 py-1 font-bold'>Shop Name : {product.sellerId?.name || "No name"}</p>
//            </div> 

//             <div className='flex gap-3 pb-10 border-b'>
//                 {
//                     product.stock ? <>
//         <div className='flex bg-slate-200 h-[50px] justify-center items-center text-xl'>
//             <div onClick={dec} className='px-6 cursor-pointer'>-</div>
//             <div className='px-6'>{quantity}</div>
//             <div onClick={inc} className='px-6 cursor-pointer'>+</div>
//         </div>
//                     <div>
//                         <button onClick={add_card} className='px-8 py-3 h-[50px] cursor-pointer hover:shadow-lg hover:shadow-green-500/40 bg-[#059473] text-white'>Add To Card</button>
//                     </div>
                    
//                     </> : ''
//                 }

//                 <div>
//                     <div onClick={add_wishlist} className='h-[50px] w-[50px] flex justify-center items-center cursor-pointer hover:shadow-lg hover:shadow-cyan-500/40 bg-cyan-500 text-white'>
//                     <FaHeart />
//                     </div> 
//                 </div> 
//             </div>  


//         <div className='flex py-5 gap-5'>
//             <div className='w-[150px] text-black font-bold text-xl flex flex-col gap-5'>
                 
//                 <span>Availability</span>
//                 <span>Share On</span> 
//             </div> 
//             <div className='flex flex-col gap-5'>
//                 <span className={`text-${product.stock ? 'green' : 'red'}-500`}>
//                     {product.stock ? `In Stock(${product.stock})` : 'Out Of Stock'}
//                 </span> 

//     <ul className='flex justify-start items-center gap-3'>
//         <li>
//             <a className='w-[38px] h-[38px] hover:bg-[#059473] hover:text-white flex justify-center items-center bg-indigo-500 rounded-full text-white' href="#"> <FaFacebookF /> </a>
//         </li>
//         <li>
//             <a className='w-[38px] h-[38px] hover:bg-[#059473] hover:text-white flex justify-center items-center bg-cyan-500 rounded-full text-white' href="#"> <FaTwitter /> </a>
//         </li>
//         <li>
//             <a className='w-[38px] h-[38px] hover:bg-[#059473] hover:text-white flex justify-center items-center bg-purple-500 rounded-full text-white' href="#"> <FaLinkedin /> </a>
//         </li>
//         <li>
//             <a className='w-[38px] h-[38px] hover:bg-[#059473] hover:text-white flex justify-center items-center bg-blue-500 rounded-full text-white' href="#"> <FaGithub /> </a>
//         </li>
//     </ul> 

//             </div>
//           </div>

//           <div className='flex gap-3'>
//                 {/* {
//                     product.stock ? <button onClick={buynow} className='px-8 py-3 h-[50px] cursor-pointer hover:shadow-lg hover:shadow-green-500/40 bg-[#247462] text-white'>Buy Now</button> : ''
//                 } */}
//                 <button onClick={chatWithSeller} className='px-8 py-3 h-[50px] cursor-pointer hover:shadow-lg hover:shadow-red-500/40 bg-red-500 text-white'>
//                     Chat Seller
//                 </button>
//             </div>


//              </div>   
//             </div> 
//        </div> 
//         </section>




// <section>
// <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
// <h2 className='text-2xl py-8 text-slate-600'>Related Products </h2>
// <div>
//     <Swiper
//     slidesPerView='auto'
//     breakpoints={{
//         1280 : {
//             slidesPerView: 3
//         },
//         565 : {
//             slidesPerView: 2
//         }
//     }}
//     spaceBetween={25}
//     loop={true}
//     pagination={{
//         clickable: true,
//         el: '.custom_bullet'
//     }}
//     modules={[Pagination]}
//     className='mySwiper' 
//     > 

//     {/* {
//         relatedProducts.map((p, i) => {
//             return (

//                 <SwiperSlide key={i}>
//                     <Link className='block'>
//                         <div className='relative h-[270px]'>
//                             <div className='w-full h-full'>
//                     <img className='w-full h-full' src={p.images[0] } alt="" />
//                     <div className='absolute h-full w-full top-0 left-0 bg-[#000] opacity-25 hover:opacity-50 transition-all duration-500'> 
//                     </div>
//                            </div>
//             {
//             p.discount !== 0 && <div className='flex justify-center items-center absolute text-white w-[38px] h-[38px] rounded-full bg-red-500 font-semibold text-xs left-2 top-2'>{p.discount}%
//             </div>
//             } 
//                 </div>

//             <div className='p-4 flex flex-col gap-1'>
//             <h2 className='text-slate-600 text-lg font-bold'>{p.name} </h2>
//             <div className='flex justify-start items-center gap-3'>
//                 <h2 className='text-lg font-bold text-slate-600'>${p.price}</h2>
//                 <div className='flex'>
//                     <Rating ratings={p.rating}  />
//                 </div>
//             </div>
//             </div>

//                     </Link>

//                 </SwiperSlide>

//             )
//         })
//     } */}
    
//     </Swiper>
// </div>

//       <div className='w-full flex justify-center items-center py-8'>
//         <div className='custom_bullet justify-center gap-3 !w-auto'> 
//         </div>

//       </div>

// </div>
// </section>




//             <Footer/> 
//         </div>
//     );
// };

// export default Details;
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io"; 
import Carousel from 'react-multi-carousel'; 
import 'react-multi-carousel/lib/styles.css'
import Rating from '../components/Rating';
import { FaHeart } from "react-icons/fa6";
import { FaFacebookF} from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoChatbubbleEllipses } from "react-icons/io5";
import ProductChat from '../components/ProductChat';
import Reviews from '../components/Reviews';
import {Pagination } from 'swiper/modules';
import 'swiper/css'; 
import 'swiper/css/pagination';
import {Swiper, SwiperSlide } from 'swiper/react';
import { useDispatch, useSelector } from 'react-redux';
import { product_details } from '../store/reducers/homeReducer';
import toast from 'react-hot-toast';
import { add_to_card, messageClear, add_to_wishlist } from '../store/reducers/cardReducer';
 
const Details = () => {
    const navigate = useNavigate();
    const {_id} = useParams();
    const dispatch = useDispatch();
    const {product} = useSelector(state => state.home);
    const {userInfo} = useSelector(state => state.auth);
    const {errorMessage, successMessage} = useSelector(state => state.card);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        dispatch(product_details(_id));
    }, [_id, dispatch]);
   
    useEffect(() => { 
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());  
        } 
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());  
        } 
    }, [successMessage, errorMessage, dispatch]);

    const [image, setImage] = useState('');
    const [state, setState] = useState('reviews');

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 5
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4
        },
        mdtablet: {
            breakpoint: { max: 991, min: 464 },
            items: 4
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 3
        },
        smmobile: {
            breakpoint: { max: 640, min: 0 },
            items: 2
        },
        xsmobile: {
            breakpoint: { max: 440, min: 0 },
            items: 1
        },
    };

    const [quantity, setQuantity] = useState(1);

    const inc = () => {
        if (quantity >= product.stock) {
            toast.error('Out of Stock');
        } else {
            setQuantity(quantity + 1);
        }
    };

    const dec = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const add_card = () => {
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity,
                productId: product._id
            }));
        } else {
            navigate('/login');
        }
    };

    const add_wishlist = () => {
        if (userInfo) {
            dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: product._id,
            }));
        } else {
            navigate('/login');
        }
    };

    const buynow = () => {
        let price = 0;
        if (product.discount !== 0) {
            price = product.price - Math.floor((product.price * product.discount) / 100);
        } else {
            price = product.price;
        }

        const obj = [
            {
                sellerId: product.sellerId,
                shopName: product.shopName,
                price: quantity * (price - Math.floor((price * 5) / 100)),
                products: [
                    {
                        quantity,
                        productInfo: product
                    }
                ]
            }
        ];
        
        navigate('/shipping', {
            state: {
                products: obj,
                price: price * quantity,
                shipping_fee: 50,
                items: 1
            }
        });
    };

    const chatWithSeller = () => {
        if (!userInfo) {
            toast.error("Please login to chat with the seller");
            navigate('/login');
            return;
        }
        
        if (!product || !product.sellerId) {
            toast.error("Seller information not found");
            return;
        }
        
        if (userInfo.role !== 'customer') {
            toast.error("Only customers can chat with sellers");
            return;
        }
        
        setShowChat(true);
    };

    return (
        <div className="bg-gray-50">
            {showChat && product?.sellerId && (
                <ProductChat 
                    sellerId={typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}
                    sellerInfo={{
                        name: typeof product.sellerId === 'object' ? product.sellerId.name : product.shopName,
                        shopName: typeof product.sellerId === 'object' ? product.sellerId.shopName : product.shopName,
                        avatar: typeof product.sellerId === 'object' ? product.sellerId.image : null
                    }}
                    productId={_id}
                    productName={product.name}
                    onClose={() => setShowChat(false)}
                />
            )}
            
            <Header/>
            
            {/* Banner Section */}
            <section className='relative h-[180px] mt-6 bg-pink-100 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Product Details</h2>
                    <div className='flex justify-center items-center gap-2 text-gray-600'>
                        <Link to='/' className="hover:text-pink-500 transition-all">Home</Link>
                        <span className='pt-1'><IoIosArrowForward /></span>
                        <span className="text-pink-500">Product Details</span>
                    </div>
                </div>
            </section>

            {/* Breadcrumb Section */}
            <section className='bg-white py-3 shadow-sm mb-6'>
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto'>
                    <div className='flex justify-start items-center text-sm text-gray-500 w-full'>
                        <Link to='/' className="hover:text-pink-500 transition-all">Home</Link>
                        <span className='pt-1 mx-1'><IoIosArrowForward /></span>
                        <Link to='/' className="hover:text-pink-500 transition-all">
                            {product.categoryId?.name || "No Category"}
                        </Link>
                        <span className='pt-1 mx-1'><IoIosArrowForward /></span>
                        <span className="text-pink-500">{product.name}</span>
                    </div>
                </div>
            </section>

            {/* Product Details Section */}
            <section>
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto pb-16'>
                    <div className='grid grid-cols-2 md-lg:grid-cols-1 gap-8'>
                        {/* Product Images */}
                        <div>
                            <div className='p-4 border border-pink-100 rounded-lg bg-white shadow-sm'>
                                <div className="flex items-center justify-center h-[400px] overflow-hidden">
                                    <img 
                                        className='max-h-full max-w-full object-contain' 
                                        src={image ? image : product.images?.[0]} 
                                        alt={product.name} 
                                    />
                                </div>
                            </div>
                            <div className='py-3'>
                                {product.images && (
                                    <Carousel
                                        autoPlay={true}
                                        infinite={true} 
                                        responsive={responsive}
                                        transitionDuration={500}
                                    >
                                        {product.images.map((img, i) => (
                                            <div key={i} className="px-1" onClick={() => setImage(img)}>
                                                <div className="border border-pink-100 rounded-md p-2 hover:border-pink-300 transition-all cursor-pointer">
                                                    <div className="h-[100px] flex items-center justify-center">
                                                        <img 
                                                            className='max-h-full max-w-full object-contain' 
                                                            src={img} 
                                                            alt={`Product view ${i+1}`} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Carousel>
                                )}
                            </div>    
                        </div>

                        {/* Product Information */}
                        <div className='flex flex-col gap-5 bg-white p-6 rounded-lg shadow-sm border border-pink-50'>
                            <div className='text-3xl text-gray-800 font-bold'>
                                <h3>{product.name}</h3>
                            </div>
                            <div className='flex justify-start items-center gap-4'>
                                <div className='flex text-xl'>
                                    <Rating ratings={product.rating} />
                                </div>
                                <span className='text-green-500'>(24 reviews)</span> 
                            </div>

                            <div className='text-2xl font-bold flex gap-3'>
                                {product.discount !== 0 ? (
                                    <>
                                        <span className='text-gray-500'>Price:</span>
                                        <h2 className='line-through text-gray-400'>${product.price}</h2>
                                        <h2 className='text-pink-500'>
                                            ${product.price - Math.floor((product.price * product.discount) / 100)} 
                                            <span className='ml-1 text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-md'>
                                                -{product.discount}%
                                            </span>
                                        </h2>
                                    </>
                                ) : (
                                    <>
                                        <span className='text-gray-500'>Price:</span>
                                        <h2 className='text-pink-500'>${product.price}</h2>
                                    </>
                                )}
                            </div> 

                            <div className='text-gray-600 border-t border-pink-100 pt-4'>
                                <p className="leading-relaxed">{product.description}</p>
                                <p className='text-gray-700 py-2 font-medium'>
                                    <span className="text-gray-500">Shop Name:</span> {product.sellerId?.name || "No name"}
                                </p>
                            </div> 

                            <div className='flex gap-3 py-4 border-b border-pink-100'>
                                {product.stock ? (
                                    <>
                                        <div className='flex bg-gray-100 h-[50px] justify-center items-center text-xl rounded-md overflow-hidden'>
                                            <button 
                                                onClick={dec} 
                                                className='px-6 h-full cursor-pointer hover:bg-pink-500 hover:text-white transition-all'
                                            >
                                                -
                                            </button>
                                            <div className='px-6'>{quantity}</div>
                                            <button 
                                                onClick={inc} 
                                                className='px-6 h-full cursor-pointer hover:bg-pink-500 hover:text-white transition-all'
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={add_card} 
                                            className='px-8 py-3 h-[50px] cursor-pointer bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-all shadow-sm'
                                        >
                                            Add To Cart
                                        </button>
                                    </>
                                ) : ''}

                                <button 
                                    onClick={add_wishlist} 
                                    className='h-[50px] w-[50px] flex justify-center items-center cursor-pointer bg-pink-100 text-pink-500 rounded-md hover:bg-pink-200 transition-all'
                                >
                                    <FaHeart />
                                </button>
                            </div>  

                            <div className='flex py-4 gap-5'>
                                <div className='w-[150px] text-gray-700 font-bold text-lg flex flex-col gap-5'>
                                    <span>Availability</span>
                                    <span>Share On</span> 
                                </div> 
                                <div className='flex flex-col gap-5'>
                                    <span className={`text-${product.stock ? 'green' : 'red'}-500 font-medium`}>
                                        {product.stock ? `In Stock (${product.stock})` : 'Out Of Stock'}
                                    </span> 

                                    <ul className='flex justify-start items-center gap-2'>
                                        <li>
                                            <a 
                                                className='w-[38px] h-[38px] flex justify-center items-center bg-[#3b5998] rounded-full text-white hover:bg-pink-500 transition-all' 
                                                href="#"
                                            >
                                                <FaFacebookF />
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                className='w-[38px] h-[38px] flex justify-center items-center bg-[#1da1f2] rounded-full text-white hover:bg-pink-500 transition-all' 
                                                href="#"
                                            >
                                                <FaTwitter />
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                className='w-[38px] h-[38px] flex justify-center items-center bg-[#0077b5] rounded-full text-white hover:bg-pink-500 transition-all' 
                                                href="#"
                                            >
                                                <FaLinkedin />
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                className='w-[38px] h-[38px] flex justify-center items-center bg-[#333] rounded-full text-white hover:bg-pink-500 transition-all' 
                                                href="#"
                                            >
                                                <FaGithub />
                                            </a>
                                        </li>
                                    </ul> 
                                </div>
                            </div>

                            <div className='flex gap-3 pt-2'>
                                {product.stock ? (
                                    <button 
                                        onClick={buynow} 
                                        className='px-8 py-3 h-[50px] cursor-pointer bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-all shadow-sm'
                                    >
                                        Buy Now
                                    </button>
                                ) : ''}
                                <button 
                                    onClick={chatWithSeller} 
                                    className='px-8 py-3 h-[50px] cursor-pointer bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-all shadow-sm flex items-center gap-2'
                                >
                                    <IoChatbubbleEllipses />
                                    Chat with Seller
                                </button>
                            </div>
                        </div>   
                    </div> 
                </div> 
            </section>

            {/* Related Products Section */}
            <section className="bg-white py-10">
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800 border-b border-pink-100 pb-2'>Related Products</h2>
                    <div>
                        <Swiper
                            slidesPerView='auto'
                            breakpoints={{
                                1280: {
                                    slidesPerView: 3
                                },
                                565: {
                                    slidesPerView: 2
                                }
                            }}
                            spaceBetween={25}
                            loop={true}
                            pagination={{
                                clickable: true,
                                el: '.custom_bullet'
                            }}
                            modules={[Pagination]}
                            className='mySwiper'
                        > 
                            {/* Related products would go here */}
                        </Swiper>
                    </div>

                    <div className='w-full flex justify-center items-center py-8'>
                        <div className='custom_bullet justify-center gap-3 !w-auto'></div>
                    </div>
                </div>
            </section>

            <Footer/> 
        </div>
    );
};

export default Details;