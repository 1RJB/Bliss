using Microsoft.AspNetCore.Mvc;

namespace Bliss.Models
{
    public enum VoucherStatus
    {
        Available,
        Redeemed,
        Expired
    }

    public enum MemberType
    {
        Basic,
        Green,
        Premium
    }
}
