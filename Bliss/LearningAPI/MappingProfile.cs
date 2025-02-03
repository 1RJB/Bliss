using AutoMapper;
using BlissAPI.Models;

namespace BlissAPI
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Voucher, VoucherDTO>();
            CreateMap<User, UserDTO>();
            CreateMap<User, UserBasicDTO>();
        }
    }
}
