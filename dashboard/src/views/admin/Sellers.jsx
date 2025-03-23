import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { FaEye, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_sellers, createSeller, messageClear } from '../../store/Reducers/sellerReducer';
import { toast } from 'react-hot-toast';

const Sellers = () => {

    const dispatch = useDispatch()

    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [perPage, setPerPage] = useState(5)
    const [show, setShow] = useState(false)
    const [statusFilter, setStatusFilter] = useState('')

    // State cho modal thêm seller
    const [showAddModal, setShowAddModal] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const { sellers, totalSeller, successMessage, errorMessage, loader } = useSelector(state => state.seller)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(createSeller(formData))
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            setShowAddModal(false)
            setFormData({
                name: '',
                email: '',
                password: ''
            })
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    useEffect(() => {
        const obj = {
            perPage: parseInt(perPage),
            page: parseInt(currentPage),
            searchValue,
            status: statusFilter
        }
        dispatch(get_sellers(obj))
    }, [searchValue, currentPage, perPage, statusFilter])

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <h1 className='text-[20px] font-bold mb-3'>Seller </h1>
            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>

                <div className='flex justify-between items-center mb-5'>
                    <div className='flex items-center gap-3'>
                        <select onChange={(e) => setPerPage(parseInt(e.target.value))} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                        <select 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            value={statusFilter}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="deactive">Deactive</option>
                        </select>
                        <input onChange={e => setSearchValue(e.target.value)} value={searchValue} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='search' />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className='flex items-center gap-2 bg-indigo-500 px-4 py-2 rounded-md text-white hover:bg-indigo-600 transition-all'>
                        <FaPlus /> Add Seller
                    </button>
                </div>

                <div className='relative overflow-x-auto'>
                    <table className='w-full text-sm text-left text-[#d0d2d6]'>
                        <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>No</th>
                                <th scope='col' className='py-3 px-4'>Image</th>
                                <th scope='col' className='py-3 px-4'>Name</th>
                                {/* <th scope='col' className='py-3 px-4'>Payment Status</th> */}
                                <th scope='col' className='py-3 px-4'>Email</th>
                                <th scope='col' className='py-3 px-4'>Status</th>
                                {/* <th scope='col' className='py-3 px-4'>District</th> */}
                                <th scope='col' className='py-3 px-4'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                sellers.map((d, i) => <tr key={i}>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{i + 1}</td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
                                        <img className='w-[45px] h-[45px]' src={d.image ? d.image : '/images/admin.jpg'} alt="" />
                                    </td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.name} </td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.email} </td>

                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.status} </td>


                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
                                        <div className='flex justify-start items-center gap-4'>
                                            <Link to={`/admin/dashboard/seller/details/${d._id}`} className='p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50'> <FaEye /> </Link>

                                        </div>

                                    </td>
                                </tr>)
                            }


                        </tbody>
                    </table>
                </div>

                {
                    totalSeller <= perPage ? <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalSeller}
                            parPage={perPage}
                            showItem={4}
                        />
                    </div> : ""
                }
            </div>
            
            {/* Modal thêm seller */}
            {showAddModal && (
                <div className='fixed top-0 left-0 w-full h-screen bg-[#0000004a] flex items-center justify-center z-50'>
                    <div className='p-5 bg-[#283046] w-[500px] rounded-md'>
                        <h2 className='text-[20px] font-bold text-white mb-3'>Add New Seller</h2>
                        <form onSubmit={handleSubmit}>
                            <div className='flex flex-col gap-3 mb-3'>
                                <label htmlFor='name' className='text-[#d0d2d6]'>Name</label>
                                <input 
                                    type='text' 
                                    id='name' 
                                    name='name' 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder='Enter name' 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-3 mb-3'>
                                <label htmlFor='email' className='text-[#d0d2d6]'>Email</label>
                                <input 
                                    type='email' 
                                    id='email' 
                                    name='email' 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder='Enter email' 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-3 mb-5'>
                                <label htmlFor='password' className='text-[#d0d2d6]'>Password</label>
                                <input 
                                    type='password' 
                                    id='password' 
                                    name='password' 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder='Enter password' 
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    required
                                />
                            </div>
                            <div className='flex justify-end gap-3'>
                                <button 
                                    type='button' 
                                    onClick={() => setShowAddModal(false)} 
                                    className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all'
                                >
                                    Cancel
                                </button>
                                <button 
                                    type='submit' 
                                    className={`px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all ${loader ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={loader}
                                >
                                    {loader ? 'Processing...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sellers;