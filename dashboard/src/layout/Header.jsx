// import React from 'react';
// import { FaList } from 'react-icons/fa';
// import { useSelector } from 'react-redux';
// import NotificationIcon from '../views/components/NotificationIcon';

// const Header = ({ showSidebar, setShowSidebar }) => {

//   const { userInfo } = useSelector(state => state.auth)

//   return (
//     <div className='fixed top-0 left-0 w-full py-5 px-2 lg:px-7 z-40'>
//       <div className='ml-0 lg:ml-[260px] rounded-md h-[65px] flex justify-between items-center bg-[#b1addf] px-5 transition-all'>

//         <div onClick={() => setShowSidebar(!showSidebar)} className='w-[35px] flex lg:hidden h-[35px] rounded-sm bg-indigo-500 shadow-lg hover:shadow-indigo-500/50 justify-center items-center cursor-pointer ' >
//           <span><FaList /></span>
//         </div>

//         <div className='flex w-full justify-end items-center'>
//             <div className='flex justify-center items-center gap-3'>
//               {(userInfo.role === 'seller') && (
//                 <div className="mr-4">
//                   <NotificationIcon />
//                 </div>
//               )}
//               <div className='flex justify-center items-center flex-col text-end'>
//                 <h2 className='text-md font-bold'>{userInfo.name}</h2>
//                 <span className='text-[14px] w-full font-normal'>{userInfo.role}</span>
//               </div>

//               {
//                 userInfo.role === 'admin' ? <img className='w-[45px] h-[45px] rounded-full overflow-hidden' src="/images/admin.jpg" alt="" /> : <img className='w-[45px] h-[45px] rounded-full overflow-hidden' src={userInfo.image} alt="" />
//               }


//             </div>
//         </div>


//       </div>
//     </div>
//   );
// };

// export default Header;
import React from 'react';
import { FaList } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import NotificationIcon from '../views/components/NotificationIcon';

const Header = ({ showSidebar, setShowSidebar }) => {
  const { userInfo } = useSelector(state => state.auth);

  return (
    <div className='fixed top-0 left-0 w-full py-3 px-2 lg:px-7 z-40'>
      <div className='ml-0 lg:ml-[260px] rounded-md h-[65px] flex justify-between items-center bg-white shadow-md px-5 transition-all'>
        <div 
          onClick={() => setShowSidebar(!showSidebar)} 
          className='w-[40px] flex lg:hidden h-[40px] rounded-full bg-pink-500 shadow-sm hover:bg-pink-600 text-white justify-center items-center cursor-pointer transition-all' 
        >
          <span><FaList /></span>
        </div>

        <div className='flex w-full justify-end items-center'>
          <div className='flex justify-center items-center gap-4'>
            {(userInfo.role === 'seller') && (
              <div className="relative mr-2">
                <NotificationIcon />
              </div>
            )}
            
            <div className='flex justify-center items-center gap-3 bg-pink-50 py-2 px-4 rounded-full border border-pink-100'>
              {userInfo.role === 'admin' ? (
                <img 
                  className='w-[38px] h-[38px] rounded-full object-cover border-2 border-pink-200' 
                  src="/images/admin.jpg" 
                  alt="Admin" 
                />
              ) : (
                <img 
                  className='w-[38px] h-[38px] rounded-full object-cover border-2 border-pink-200' 
                  src={userInfo.image} 
                  alt={userInfo.name} 
                />
              )}
              
              <div className='flex justify-center items-center flex-col text-end'>
                <h2 className='text-sm font-bold text-gray-800'>{userInfo.name}</h2>
                <span className='text-xs w-full font-medium text-pink-600 capitalize'>{userInfo.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;