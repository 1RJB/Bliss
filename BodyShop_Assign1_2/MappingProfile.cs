using AutoMapper;
using BodyShop_Assign1_2.Models;

namespace BodyShop_Assign1_2
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, TutorialDTO>();
            CreateMap<User, UserBasicDTO>();
        }

    }
}
