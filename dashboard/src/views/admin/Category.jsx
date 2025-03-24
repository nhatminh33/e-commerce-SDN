// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import Pagination from '../Pagination';
// import { FaEdit, FaTrash, FaImage } from 'react-icons/fa';
// import { IoMdCloseCircle } from "react-icons/io";
// import { PropagateLoader } from 'react-spinners';
// import { overrideStyle } from '../../utils/utils';
// import { categoryAdd, messageClear, get_category, updateCategory, deleteCategory } from '../../store/Reducers/categoryReducer';
// import { useDispatch, useSelector } from 'react-redux';
// import toast from 'react-hot-toast';
// import Search from '../components/Search';

// const Category = () => {
//     const dispatch = useDispatch()
//     const { loader, successMessage, errorMessage, categorys, totalCategory, pages } = useSelector(state => state.category)

//     const [currentPage, setCurrentPage] = useState(1)
//     const [searchValue, setSearchValue] = useState('')
//     const [parPage, setParPage] = useState(10)
//     const [show, setShow] = useState(false)
//     const [imageShow, setImage] = useState('')
//     const [isEdit, setIsEdit] = useState(false)
//     const [editId, setEditId] = useState(null)

//     const [state, setState] = useState({
//         name: '',
//         image: ''
//     })

//     const imageHandle = (e) => {
//         let files = e.target.files
//         if (files.length > 0) {
//             setImage(URL.createObjectURL(files[0]))
//             setState({
//                 ...state,
//                 image: files[0]
//             })
//         }
//     }

//     const resetForm = () => {
//         setState({
//             name: '',
//             image: ''
//         })
//         setImage('')
//         setIsEdit(false)
//         setEditId(null)
//         setShow(false)
//     }

//     const addOrUpdateCategory = async (e) => {
//         e.preventDefault()
//         const formData = new FormData()
//         formData.append('name', state.name)
        
//         if (state.image) {
//             formData.append('image', state.image)
//         }

//         try {
//             if (isEdit) {
//                 await dispatch(updateCategory({ id: editId, formData })).unwrap()
//             } else {
//                 await dispatch(categoryAdd(formData)).unwrap()
//             }
//             resetForm()
//         } catch (error) {
//             console.error('Operation failed:', error)
//         }
//     }

//     useEffect(() => {
//         if (successMessage) {
//             toast.success(successMessage)
//             dispatch(messageClear())
//             resetForm()
//         }
//         if (errorMessage) {
//             toast.error(errorMessage)
//             dispatch(messageClear())
//         }
//     }, [successMessage, errorMessage, dispatch])

//     useEffect(() => {
//         dispatch(get_category({
//             perPage: parseInt(parPage),
//             page: parseInt(currentPage),
//             searchValue
//         }))
//     }, [searchValue, currentPage, parPage, dispatch])

//     const handleEdit = (category) => {
//         setState({
//             name: category.name,
//             image: ''  // Reset image since we don't want to send the URL
//         })
//         setImage(category.image)  // Show current image
//         setEditId(category._id)
//         setIsEdit(true)
//         setShow(true)
//     }

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to delete this category?')) {
//             try {
//                 await dispatch(deleteCategory(id)).unwrap()
//                 toast.success('Category deleted successfully')
//             } catch (error) {
//                 toast.error('Failed to delete category')
//             }
//         }
//     }

//     return (
//         <div className='px-2 lg:px-7 pt-5'>
//             <div className='flex lg:hidden justify-between items-center mb-5 p-4 bg-[#6a5fdf] rounded-md'>
//                 <h1 className='text-[#d0d2d6] font-semibold text-lg'>Categories</h1>
//                 <button onClick={() => setShow(true)} className='bg-red-500 shadow-lg hover:shadow-red-500/40 px-4 py-2 cursor-pointer text-white rounded-sm text-sm'>Add New</button>
//             </div>

//             <div className='flex flex-wrap w-full'>
//                 <div className='w-full lg:w-7/12'>
//                     <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
//                         <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue} />

//                         <div className='relative overflow-x-auto'>
//                             <table className='w-full text-sm text-left text-[#d0d2d6]'>
//                                 <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
//                                     <tr>
//                                         <th scope='col' className='py-3 px-4'>No</th>
//                                         <th scope='col' className='py-3 px-4'>Image</th>
//                                         <th scope='col' className='py-3 px-4'>Name</th>
//                                         <th scope='col' className='py-3 px-4'>Actions</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {
//                                         categorys.map((d, i) => (
//                                             <tr key={d._id}>
//                                                 <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{i + 1}</td>
//                                                 <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
//                                                     <img className='w-[45px] h-[45px] object-cover rounded' src={d.image} alt={d.name} />
//                                                 </td>
//                                                 <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.name}</td>
//                                                 <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
//                                                     <div className='flex justify-start items-center gap-4'>
//                                                         <button 
//                                                             className='p-[6px] bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50'
//                                                             onClick={() => handleEdit(d)}
//                                                             disabled={loader}
//                                                         >
//                                                             <FaEdit />
//                                                         </button>
//                                                         <button 
//                                                             className='p-[6px] bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50'
//                                                             onClick={() => handleDelete(d._id)}
//                                                             disabled={loader}
//                                                         >
//                                                             <FaTrash />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     }
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
//                             <Pagination
//                                 pageNumber={currentPage}
//                                 setPageNumber={setCurrentPage}
//                                 totalItem={totalCategory}
//                                 parPage={parPage}
//                                 showItem={3}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className={`w-[320px] lg:w-5/12 translate-x-100 lg:relative lg:right-0 fixed ${show ? 'right-0' : '-right-[340px]'} z-[9999] top-0 transition-all duration-500`}>
//                     <div className='w-full pl-5'>
//                         <div className='bg-[#6a5fdf] h-screen lg:h-auto px-3 py-2 lg:rounded-md text-[#d0d2d6]'>
//                             <div className='flex justify-between items-center mb-4'>
//                                 <h1 className='text-[#d0d2d6] font-semibold text-xl mb-4 w-full text-center'>{isEdit ? 'Edit Category' : 'Add Category'}</h1>
//                                 <div onClick={() => setShow(false)} className='block lg:hidden cursor-pointer'>
//                                     <IoMdCloseCircle size={24} />
//                                 </div>
//                             </div>

//                             <form onSubmit={addOrUpdateCategory}>
//                                 <div className='flex flex-col w-full gap-1 mb-3'>
//                                     <label htmlFor="name">Category Name</label>
//                                     <input
//                                         value={state.name}
//                                         onChange={(e) => setState({ ...state, name: e.target.value })}
//                                         className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#ffffff] border border-slate-700 rounded-md text-[#000000]'
//                                         type="text"
//                                         id='name'
//                                         name='category_name'
//                                         placeholder='Enter category name'
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className='flex justify-center items-center flex-col h-[238px] cursor-pointer border border-dashed hover:border-red-500 w-full border-[#d0d2d6]' htmlFor="image">
//                                         {
//                                             imageShow ? (
//                                                 <img className='w-full h-full object-cover' src={imageShow} alt="Preview" />
//                                             ) : (
//                                                 <>
//                                                     <span><FaImage size={50} /></span>
//                                                     <span>Select Image</span>
//                                                 </>
//                                             )
//                                         }
//                                     </label>
//                                     <input 
//                                         onChange={imageHandle} 
//                                         className='hidden' 
//                                         type="file" 
//                                         name="image" 
//                                         id="image" 
//                                         accept="image/*" 
//                                         required={!isEdit} 
//                                     />
//                                 </div>

//                                 <div className='mt-4'>
//                                     <button
//                                         disabled={loader}
//                                         type="submit"
//                                         className='bg-red-500 w-full hover:shadow-red-300/50 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3 disabled:opacity-50'
//                                     >
//                                         {
//                                             loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : (isEdit ? 'Update' : 'Add New')
//                                         }
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Category;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import { IoMdCloseCircle } from "react-icons/io";
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { categoryAdd, messageClear, get_category, updateCategory, deleteCategory } from '../../store/Reducers/categoryReducer';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Search from '../components/Search';

const Category = () => {
    const dispatch = useDispatch()
    const { loader, successMessage, errorMessage, categorys, totalCategory, pages } = useSelector(state => state.category)

    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(10)
    const [show, setShow] = useState(false)
    const [imageShow, setImage] = useState('')
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState(null)

    const [state, setState] = useState({
        name: '',
        image: ''
    })

    const imageHandle = (e) => {
        let files = e.target.files
        if (files.length > 0) {
            setImage(URL.createObjectURL(files[0]))
            setState({
                ...state,
                image: files[0]
            })
        }
    }

    const resetForm = () => {
        setState({
            name: '',
            image: ''
        })
        setImage('')
        setIsEdit(false)
        setEditId(null)
        setShow(false)
    }

    const addOrUpdateCategory = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', state.name)
        
        if (state.image) {
            formData.append('image', state.image)
        }

        try {
            if (isEdit) {
                await dispatch(updateCategory({ id: editId, formData })).unwrap()
            } else {
                await dispatch(categoryAdd(formData)).unwrap()
            }
            resetForm()
        } catch (error) {
            console.error('Operation failed:', error)
        }
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            resetForm()
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    useEffect(() => {
        dispatch(get_category({
            perPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }))
    }, [searchValue, currentPage, parPage, dispatch])

    const handleEdit = (category) => {
        setState({
            name: category.name,
            image: ''  // Reset image since we don't want to send the URL
        })
        setImage(category.image)  // Show current image
        setEditId(category._id)
        setIsEdit(true)
        setShow(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await dispatch(deleteCategory(id)).unwrap()
                toast.success('Category deleted successfully')
            } catch (error) {
                toast.error('Failed to delete category')
            }
        }
    }

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='flex lg:hidden justify-between items-center mb-5 p-4 bg-white rounded-md shadow-md'>
                <h1 className='text-gray-700 font-semibold text-lg'>Categories</h1>
                <button onClick={() => setShow(true)} className='bg-pink-500 shadow-lg hover:shadow-pink-500/40 px-4 py-2 cursor-pointer text-white rounded-md text-sm'>Add New</button>
            </div>

            <div className='flex flex-wrap w-full'>
                <div className='w-full lg:w-7/12'>
                    <div className='w-full p-4 bg-white rounded-md shadow-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl text-pink-600 font-bold'>Categories</h2>
                            <button 
                                onClick={() => setShow(true)} 
                                className='bg-pink-500 shadow-lg hidden lg:block hover:shadow-pink-500/40 px-4 py-2 cursor-pointer text-white rounded-md text-sm'
                            >
                                Add New Category
                            </button>
                        </div>
                        
                        <div className='mb-6'>
                            <div className='flex items-center gap-4'>
                                <select 
                                    onChange={(e) => setParPage(parseInt(e.target.value))} 
                                    className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="15">15 per page</option>
                                    <option value="20">20 per page</option>
                                </select>
                                <input 
                                    onChange={(e) => setSearchValue(e.target.value)} 
                                    value={searchValue} 
                                    className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700 flex-grow' 
                                    type="text" 
                                    placeholder='Search categories...' 
                                />
                            </div>
                        </div>

                        <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
                            <table className='w-full text-sm text-left text-gray-700'>
                                <thead className='text-xs text-gray-700 uppercase bg-pink-50'>
                                    <tr>
                                        <th scope='col' className='py-3 px-4'>No</th>
                                        <th scope='col' className='py-3 px-4'>Image</th>
                                        <th scope='col' className='py-3 px-4'>Name</th>
                                        <th scope='col' className='py-3 px-4'>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categorys.length > 0 ? (
                                        categorys.map((d, i) => (
                                            <tr key={d._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-pink-50'} border-b border-pink-100 hover:bg-pink-100`}>
                                                <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{i + 1}</td>
                                                <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                    <img className='w-[45px] h-[45px] object-cover rounded-full border border-pink-200' src={d.image} alt={d.name} />
                                                </td>
                                                <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>{d.name}</td>
                                                <td scope='row' className='py-3 px-4 font-medium whitespace-nowrap'>
                                                    <div className='flex justify-start items-center gap-4'>
                                                        <button 
                                                            className='p-[6px] bg-yellow-500 rounded-md hover:shadow-lg hover:shadow-yellow-500/50 text-white'
                                                            onClick={() => handleEdit(d)}
                                                            disabled={loader}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className='p-[6px] bg-red-500 rounded-md hover:shadow-lg hover:shadow-red-500/50 text-white'
                                                            onClick={() => handleDelete(d._id)}
                                                            disabled={loader}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className='bg-white border-b border-pink-100'>
                                            <td colSpan='4' className='py-3 px-4 text-center'>No categories found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalCategory > parPage && (
                            <div className='w-full flex justify-end mt-4'>
                                <Pagination
                                    pageNumber={currentPage}
                                    setPageNumber={setCurrentPage}
                                    totalItem={totalCategory}
                                    parPage={parPage}
                                    showItem={3}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={`w-[320px] lg:w-5/12 translate-x-100 lg:relative lg:right-0 fixed ${show ? 'right-0' : '-right-[340px]'} z-[9999] top-0 transition-all duration-500`}>
                    <div className='w-full pl-0 lg:pl-5'>
                        <div className='bg-white h-screen lg:h-auto px-4 py-4 lg:rounded-md shadow-md text-gray-700'>
                            <div className='flex justify-between items-center mb-4 border-b border-pink-100 pb-3'>
                                <h1 className='text-pink-600 font-semibold text-xl'>{isEdit ? 'Edit Category' : 'Add Category'}</h1>
                                <div onClick={() => setShow(false)} className='block lg:hidden cursor-pointer text-gray-500 hover:text-pink-600'>
                                    <IoMdCloseCircle size={24} />
                                </div>
                            </div>

                            <form onSubmit={addOrUpdateCategory}>
                                <div className='flex flex-col w-full gap-1 mb-4'>
                                    <label htmlFor="name" className='text-gray-700 font-medium'>Category Name</label>
                                    <input
                                        value={state.name}
                                        onChange={(e) => setState({ ...state, name: e.target.value })}
                                        className='px-4 py-2 focus:border-pink-500 outline-none bg-white border border-pink-200 rounded-md text-gray-700'
                                        type="text"
                                        id='name'
                                        name='category_name'
                                        placeholder='Enter category name'
                                        required
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-gray-700 font-medium mb-2'>Category Image</label>
                                    <label className='flex justify-center items-center flex-col h-[238px] cursor-pointer border border-dashed hover:border-pink-500 w-full border-pink-200 bg-pink-50 rounded-md' htmlFor="image">
                                        {
                                            imageShow ? (
                                                <img className='w-full h-full object-contain' src={imageShow} alt="Preview" />
                                            ) : (
                                                <>
                                                    <span className='text-pink-500 mb-2'><FaImage size={50} /></span>
                                                    <span className='text-gray-500'>Select Image</span>
                                                </>
                                            )
                                        }
                                    </label>
                                    <input 
                                        onChange={imageHandle} 
                                        className='hidden' 
                                        type="file" 
                                        name="image" 
                                        id="image" 
                                        accept="image/*" 
                                        required={!isEdit} 
                                    />
                                </div>

                                <div className='mt-5'>
                                    <button
                                        disabled={loader}
                                        type="submit"
                                        className='bg-pink-500 w-full hover:bg-pink-600 hover:shadow-pink-300/50 hover:shadow-lg text-white rounded-md px-7 py-2 transition duration-300 disabled:opacity-50'
                                    >
                                        {
                                            loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : (isEdit ? 'Update Category' : 'Add New Category')
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Category;