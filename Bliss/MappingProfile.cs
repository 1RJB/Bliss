using AutoMapper;
using Bliss.Models;

namespace Bliss
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDTO>();
            CreateMap<Voucher, VoucherDTO>();
            CreateMap<User, UserDTO>();
            CreateMap<User, UserBasicDTO>();
            CreateMap<ActivityLog, ActivityLogDTO>();
        }
    }
}